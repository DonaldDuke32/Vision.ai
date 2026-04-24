import fs from "fs";

async function run() {
  try {
      const parts = [
          "main/dist/gemini-watermark-remover.user.js",
          "master/dist/gemini-watermark-remover.user.js",
          "main/gemini-watermark-remover.user.js",
          "master/gemini-watermark-remover.user.js",
          "main/src/core/embeddedAlphaMaps.js",
          "master/src/core/embeddedAlphaMaps.js"
      ];
      for (const p of parts) {
          const url = `https://raw.githubusercontent.com/GargantuaX/gemini-watermark-remover/${p}`;
          const res = await fetch(url);
          if (res.ok) {
              const text = await res.text();
              fs.writeFileSync("downloaded_script.js", text);
              console.log("Success from", url);
              console.log(text.slice(0, 200));
              return;
          }
      }
      console.log("Not found in known paths.");
  } catch (e) {
      console.error(e);
  }
}
run();
