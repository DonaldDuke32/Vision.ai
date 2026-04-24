import fs from "fs";

async function run() {
  try {
      const url = `https://api.github.com/repos/GargantuaX/gemini-watermark-remover/contents/src/core`;
      const res = await fetch(url, { headers: {"User-Agent": "Node-fetch"} });
      if (res.ok) {
          const files = await res.json();
          console.log(files.map(f => f.name));
      } else {
          console.log("Failed", res.status);
      }
  } catch (e) {
      console.error(e);
  }
}
run();
