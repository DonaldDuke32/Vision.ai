import fs from "fs";

async function run() {
  try {
      const res = await fetch("https://api.github.com/users/GargantuaX/repos", {
          headers: { "User-Agent": "Node-fetch" }
      });
      const data = await res.json();
      console.log(data.map(d => d.name));
  } catch (e) {
      console.error(e);
  }
}
run();
