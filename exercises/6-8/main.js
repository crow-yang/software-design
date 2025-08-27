// UTF-8 인코딩/디코딩을 위한 전역 인코더/디코더 객체 생성
const _encoder = new TextEncoder();
const _decoder = new TextDecoder();

/**
 * Encode fixed-width strings into an ArrayBuffer.
 * Throws if any string exceeds `width` in UTF-8 bytes.
 * @param {string[]} strings
 * @param {number} width - fixed slot size in BYTES (UTF-8)
 * @returns {ArrayBuffer}
 */
export function encodeFixedWidthStrings(strings, width) {

  // 입력 매개변수 유효성 검사: strings가 배열인지 확인
  if (!Array.isArray(strings)) {
    throw new TypeError("encodeFixedWidthStrings expects an array of strings.");
  }
  // width가 0 이상의 정수인지 확인
  if (!Number.isInteger(width) || width < 0) {
    throw new TypeError("width must be a non-negative integer.");
  }

  // 배열의 문자열 개수를 저장
  const count = strings.length;
  // 모든 문자열을 UTF-8 바이트 배열로 변환하면서 검증
  const encoded = strings.map((s, i) => {
    // 각 요소가 문자열인지 확인
    if (typeof s !== "string") {
      throw new TypeError(`Item at index ${i} is not a string.`);
    }
    // 문자열을 UTF-8 바이트 배열(Uint8Array)로 인코딩
    const u8 = _encoder.encode(s);
    // 인코딩된 바이트 길이가 지정된 width를 초과하는지 검사
    if (u8.byteLength > width) {
      throw new Error(
        `String at index ${i} exceeds fixed width: ${u8.byteLength} > ${width} (bytes, UTF-8).`
      );
    }
    // 인코딩된 바이트 배열 반환
    return u8;
  });

  // 헤더 크기: count(4바이트) + width(4바이트) = 8바이트
  const HEADER_BYTES = 8; // count(uint32) + width(uint32)
  // 전체 버퍼 크기 계산: 헤더 + (문자열 개수 × 고정 너비)
  const totalBytes = HEADER_BYTES + count * width;

  // 계산된 크기의 ArrayBuffer 생성
  const buffer = new ArrayBuffer(totalBytes);
  // DataView를 사용해 헤더에 정수값을 쓰기 위한 준비
  const dv = new DataView(buffer);
  // Uint8Array로 바이트 단위 접근을 위한 뷰 생성
  const out = new Uint8Array(buffer);

  // 헤더 작성
  dv.setUint32(0, count, true);  // 0번 위치에 문자열 개수 저장 (little-endian)
  dv.setUint32(4, width, true);  // 4번 위치에 고정 너비 저장 (little-endian)

  // 페이로드(실제 문자열 데이터) 작성
  let offset = HEADER_BYTES;  // 헤더 이후부터 시작
  for (const u8 of encoded) {
    // 인코딩된 문자열 데이터를 현재 오프셋 위치에 복사
    out.set(u8, offset);
    // 남은 공간 계산 (고정 너비 - 실제 바이트 길이)
    const remaining = width - u8.byteLength;
    // 남은 공간이 있으면 0x00(null byte)으로 패딩
    if (remaining > 0) {
      out.fill(0x00, offset + u8.byteLength, offset + width);
    }
    // 다음 슬롯으로 오프셋 이동
    offset += width;
  }

  // 완성된 ArrayBuffer 반환
  return buffer;
}

/**
 * Decode an ArrayBuffer produced by encodeFixedWidthStrings.
 * Reads header (count, width), strips trailing 0x00 padding per slot, and decodes UTF-8.
 * @param {ArrayBuffer} buffer
 * @returns {string[]}
 */
export function decodeFixedWidthStrings(buffer) {

  // 입력이 ArrayBuffer인지 검증
  if (!(buffer instanceof ArrayBuffer)) {
    throw new TypeError("decodeFixedWidthStrings expects an ArrayBuffer.");
  }
  // DataView로 헤더의 정수값을 읽기 위한 준비
  const dv = new DataView(buffer);
  // Uint8Array로 바이트 단위 접근을 위한 뷰 생성
  const bytes = new Uint8Array(buffer);

  // 최소한 헤더(8바이트)는 있어야 함
  if (buffer.byteLength < 8) {
    throw new Error("Malformed buffer: smaller than header (8 bytes).");
  }

  // 헤더에서 문자열 개수와 고정 너비 읽기 (little-endian)
  const count = dv.getUint32(0, true);  // 0번 위치에서 문자열 개수 읽기
  const width = dv.getUint32(4, true);  // 4번 위치에서 고정 너비 읽기
  const HEADER_BYTES = 8;
  // 페이로드(실제 데이터) 크기 계산
  const payloadBytes = buffer.byteLength - HEADER_BYTES;

  // width가 0인 특수 케이스 처리 (모든 문자열이 빈 문자열)
  if (width === 0) {
    // width=0이면 페이로드가 없어야 함 (빈 문자열은 0바이트)
    if (payloadBytes !== 0 || count !== 0) {
      // 페이로드가 있으면 데이터 불일치 오류
      if (payloadBytes !== 0) {
        throw new Error("Malformed buffer: width is 0 but payload is non-empty.");
      }
    }
    // count 개수만큼 빈 문자열 배열 반환
    return Array.from({ length: count }, () => "");
  }

  // 페이로드 크기가 width의 배수인지 검증
  if (payloadBytes < 0 || payloadBytes % width !== 0) {
    throw new Error("Malformed buffer: payload size not a multiple of width.");
  }

  // 실제 슬롯 개수와 헤더의 count가 일치하는지 검증
  const expectedSlots = payloadBytes / width;
  if (expectedSlots !== count) {
    throw new Error(
      `Malformed buffer: header count ${count} != computed slots ${expectedSlots}.`
    );
  }

  // 결과를 저장할 배열 생성
  const result = new Array(count);
  // 헤더 다음부터 읽기 시작
  let offset = HEADER_BYTES;

  // 각 슬롯에서 문자열 추출
  for (let i = 0; i < count; i += 1) {
    // 현재 슬롯의 바이트 배열 추출 (width 크기만큼)
    const slot = bytes.subarray(offset, offset + width);

    // 뒤쪽의 0x00 패딩 제거
    let end = slot.length;
    // 뒤에서부터 0x00이 아닌 바이트를 찾을 때까지 역방향 탐색
    while (end > 0 && slot[end - 1] === 0x00) end -= 1;

    // 패딩을 제외한 실제 데이터만 추출
    const content = slot.subarray(0, end);
    // UTF-8 바이트 배열을 문자열로 디코딩
    result[i] = _decoder.decode(content);
    // 다음 슬롯으로 오프셋 이동
    offset += width;
  }

  // 디코딩된 문자열 배열 반환
  return result;
}