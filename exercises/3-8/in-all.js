import { promises as fs } from 'fs';

async function main() {
  const [,, ...files] = process.argv;
  const fileCount = files.length;

  const savedString = {};

  const saveLines = async (f) => {
    const contents = await fs.readFile(f, 'utf-8');
    const contentsArray = contents.split("\n");
    contentsArray.forEach((content) => {
      if (!savedString[content]) {
        const newSet = new Set();
        newSet.add(f);
        savedString[content] = newSet;
      } else {
        savedString[content].add(f);
      }
    })
  }
  await Promise.all(files.map(file => saveLines(file)));
  console.log(Object.keys(savedString).filter(str => savedString[str].size === fileCount).join("\n"));
}

main();

/** 테스트 
 * 루트경로에서
 * node in-all.js first.txt second.txt third.txt
*/