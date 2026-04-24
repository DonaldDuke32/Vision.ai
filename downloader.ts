import fs from "fs";

async function run() {
  const q = "https://greasyfork.org/en/scripts/501740-gemini-nanobanana-watermark-remover/code/Gemini%20NanoBanana%20Watermark%20Remover.user.js";
  try {
      const res = await fetch(q);
      if (res.ok) {
        const text = await res.text();
        fs.writeFileSync("downloaded_script.js", text);
        console.log("Downloaded successfully from greasyfork");
        console.log(text.slice(0, 100));
        return;
      }
      console.log("Failed", res.status);
    } catch (e) {
      console.error(e);
    }
}
run();
