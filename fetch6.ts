import fs from "fs";

async function run() {
  const url = `https://raw.githubusercontent.com/GargantuaX/gemini-watermark-remover/main/src/core/embeddedAlphaMaps.js`;
  const res = await fetch(url);
  const text = await res.text();
  fs.writeFileSync("src/alphaMaps.ts", text);
  console.log("Written to src/alphaMaps.ts");
}
run();
