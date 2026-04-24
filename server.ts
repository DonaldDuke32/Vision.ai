import express from "express";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import Replicate from "replicate";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for image processing
  app.post("/api/process", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided." });
      }

      if (!process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_TOKEN === "r8_YOUR_TOKEN_HERE") {
        return res.json({ 
          success: true, 
          processedImageUrl: null, 
          demoMode: true,
          message: "Clé API Replicate manquante. Simulation UI activée."
        });
      }

      const replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN,
      });

      const { resolution, removeWatermark, enhanceDetails } = req.body;
      
      // Determine scale based on resolution
      let scale = 2;
      if (resolution === "3K") scale = 3;
      if (resolution === "4K") scale = 4;

      // Convert buffer to Data URI
      const base64Image = req.file.buffer.toString("base64");
      const mimeType = req.file.mimetype;
      const dataUri = `data:${mimeType};base64,${base64Image}`;

      console.log(`Processing image with target scale: ${scale}x...`);

      // Run Real-ESRGAN on Replicate
      // Model: nightmareai/real-esrgan
      const output = await replicate.run(
        "nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
        {
          input: {
            image: dataUri,
            scale: scale,
            face_enhance: enhanceDetails === "true" || enhanceDetails === true,
          }
        }
      );

      // Depending on the api, output could be a string URL
      res.json({ success: true, processedImageUrl: output });

    } catch (error: any) {
      console.error("Processing Error:", error);
      res.status(500).json({ error: error.message || "Failed to process image." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
