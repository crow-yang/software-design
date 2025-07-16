import fs from 'fs';

const MOCK_READ_FILE_CONTROL = [false, false, true, false, true];

let mockReadFileSyncCallCount = 0;
const mockReadFileSync = (filename, encoding = 'utf-8') => {
  if (!MOCK_READ_FILE_CONTROL[mockReadFileSyncCallCount++]) {
    throw new Error("test exception");
  }
  return fs.readFileSync(filename, encoding)
}

const main = () => {
  const n = 10;
  for (let i = 0; i < n; i++) {
    try {
      console.log(mockReadFileSync("test.txt"));
    } catch(e) {
      console.log(e.message);
    }
  }
}

main();
