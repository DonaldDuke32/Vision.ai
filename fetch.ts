import fs from "fs";

async function run() {
  try {
      const res = await fetch("https://api.github.com/search/code?q=Gemini+NanoBanana+Watermark+Remover", {
          headers: { "User-Agent": "Node-fetch" }
      });
      const data = await res.json();
      console.log(JSON.stringify(data, null, 2));
  } catch (e) {
      console.error(e);
  }
}
run();
