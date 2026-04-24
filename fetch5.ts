import fs from "fs";

async function run() {
  const url = `https://raw.githubusercontent.com/GargantuaX/gemini-watermark-remover/main/src/core/blendModes.js`;
  const res = await fetch(url);
  const text = await res.text();
  console.log(text);
}
run();
