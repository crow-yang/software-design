import { encodeFixedWidthStrings, decodeFixedWidthStrings } from './main.js';

// 폴더 루트에서 node test.js 명령어로 실행

console.log('Testing fixed-width string encoding/decoding...\n');

// Test 1: Basic functionality
console.log('Test 1: Basic functionality');
const strings1 = ['hello', 'world', 'test'];
const width1 = 10;
const encoded1 = encodeFixedWidthStrings(strings1, width1);
const decoded1 = decodeFixedWidthStrings(encoded1);
console.log('Original:', strings1);
console.log('Decoded:', decoded1);
console.log('Pass:', JSON.stringify(strings1) === JSON.stringify(decoded1));
console.log();

// Test 2: Empty strings
console.log('Test 2: Empty strings');
const strings2 = ['', 'hello', ''];
const width2 = 10;
const encoded2 = encodeFixedWidthStrings(strings2, width2);
const decoded2 = decodeFixedWidthStrings(encoded2);
console.log('Original:', strings2);
console.log('Decoded:', decoded2);
console.log('Pass:', JSON.stringify(strings2) === JSON.stringify(decoded2));
console.log();

// Test 3: Unicode characters (UTF-8)
console.log('Test 3: Unicode characters');
const strings3 = ['안녕', '世界', 'café'];
const width3 = 20;
const encoded3 = encodeFixedWidthStrings(strings3, width3);
const decoded3 = decodeFixedWidthStrings(encoded3);
console.log('Original:', strings3);
console.log('Decoded:', decoded3);
console.log('Pass:', JSON.stringify(strings3) === JSON.stringify(decoded3));
console.log();

// Test 4: String that exceeds width (should throw)
console.log('Test 4: String exceeds width (should throw)');
try {
  const strings4 = ['this is a very long string'];
  const width4 = 5;
  encodeFixedWidthStrings(strings4, width4);
  console.log('Pass: false (should have thrown)');
} catch (e) {
  console.log('Pass: true (threw as expected)');
  console.log('Error message:', e.message);
}
console.log();

// Test 4-2: Unicode string that exceeds width in bytes (should throw)
console.log('Test 4-2: Unicode exceeds width in UTF-8 bytes (should throw)');
try {
  const strings4_2 = ['안녕하세요'];  // 한글 5글자 = 15 UTF-8 bytes
  const width4_2 = 10;  // 10 bytes만 허용
  encodeFixedWidthStrings(strings4_2, width4_2);
  console.log('Pass: false (should have thrown)');
} catch (e) {
  console.log('Pass: true (threw as expected)');
  console.log('Error message:', e.message);
}
console.log();

// Test 4-3: Multiple strings where one exceeds width (should throw)
console.log('Test 4-3: One string in array exceeds width (should throw)');
try {
  const strings4_3 = ['ok', 'this is too long', 'fine'];
  const width4_3 = 6;
  encodeFixedWidthStrings(strings4_3, width4_3);
  console.log('Pass: false (should have thrown)');
} catch (e) {
  console.log('Pass: true (threw as expected)');
  console.log('Error message:', e.message);
}
console.log();

// Test 5: Empty array
console.log('Test 5: Empty array');
const strings5 = [];
const width5 = 10;
const encoded5 = encodeFixedWidthStrings(strings5, width5);
const decoded5 = decodeFixedWidthStrings(encoded5);
console.log('Original:', strings5);
console.log('Decoded:', decoded5);
console.log('Pass:', JSON.stringify(strings5) === JSON.stringify(decoded5));
console.log();

// Test 6: Width of 0 with empty strings
console.log('Test 6: Width 0 with empty strings');
const strings6 = ['', '', ''];
const width6 = 0;
const encoded6 = encodeFixedWidthStrings(strings6, width6);
const decoded6 = decodeFixedWidthStrings(encoded6);
console.log('Original:', strings6);
console.log('Decoded:', decoded6);
console.log('Pass:', JSON.stringify(strings6) === JSON.stringify(decoded6));
console.log();

// Test 7: Strings exactly at width limit
console.log('Test 7: Strings exactly at width limit');
const strings7 = ['12345', 'abcde', '67890'];
const width7 = 5;
const encoded7 = encodeFixedWidthStrings(strings7, width7);
const decoded7 = decodeFixedWidthStrings(encoded7);
console.log('Original:', strings7);
console.log('Decoded:', decoded7);
console.log('Pass:', JSON.stringify(strings7) === JSON.stringify(decoded7));
console.log();

// Test 8: Check ArrayBuffer structure
console.log('Test 8: ArrayBuffer structure verification');
const strings8 = ['a', 'b'];
const width8 = 5;
const encoded8 = encodeFixedWidthStrings(strings8, width8);
const view = new DataView(encoded8);
const count = view.getUint32(0, true);
const widthFromBuffer = view.getUint32(4, true);
console.log('Count from buffer:', count, '(expected: 2)');
console.log('Width from buffer:', widthFromBuffer, '(expected: 5)');
console.log('Buffer total size:', encoded8.byteLength, '(expected: 18 = 8 header + 2*5 payload)');
console.log('Pass:', count === 2 && widthFromBuffer === 5 && encoded8.byteLength === 18);