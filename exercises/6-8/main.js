import { writeFile } from "node:fs/promises";
import https from "node:https";

const url = "https://cnp-file.covi.co.kr/player/publisher/buzzvil_web.js";

https.get(url, (res) => {
  if (res.statusCode !== 200) {
    console.error("❌ 다운로드 실패:", res.statusCode);
    res.resume();
    return;
  }

  const chunks = [];
  res.on("data", (d) => chunks.push(d));
  res.on("end", async () => {
    try {
      await writeFile("buzzvil_sdk.js", Buffer.concat(chunks));
      console.log("✅ coviplayer.js 저장 완료!");
    } catch (err) {
      console.error("❌ 파일 저장 오류:", err);
    }
  });
}).on("error", (e) => {
  console.error("❌ 요청 에러:", e);
});
