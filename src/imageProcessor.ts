import { removeWatermarkLocal } from "./watermarkRemover";

export async function processImageLocal(
  file: File,
  options: { resolution: string; removeWatermark: boolean; enhanceDetails: boolean }
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      // Scale resolution
      let scale = 1;
      if (options.resolution === "3K") scale = 1.25;
      else if (options.resolution === "4K") scale = 1.5;

      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Unable to get 2d context"));
        return;
      }

      // Apply detail enhancement via CSS filters on canvas
      if (options.enhanceDetails) {
        ctx.filter = "contrast(115%) saturate(120%) brightness(105%)";
      }

      // Draw the image, applying filters and scaling
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Reset filter for ImageData manipulation
      ctx.filter = "none";

      if (options.removeWatermark) {
        try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            // The watermark dimension is typically 96 for large, 48 for small.
            // But if we scaled the image, the watermark would ALSO scale and break pixel-perfect removal!
            // Wait, Gemini watermark was on the ORIGINAL image.
            // So we MUST remove watermark FIRST, before scaling!
            
            // Let's create an offscreen canvas for original size
            const origCanvas = document.createElement("canvas");
            origCanvas.width = img.width;
            origCanvas.height = img.height;
            const origCtx = origCanvas.getContext("2d");
            if (origCtx) {
              origCtx.drawImage(img, 0, 0);
              const origData = origCtx.getImageData(0, 0, origCanvas.width, origCanvas.height);
              
              const targetSize = img.width < 1500 ? 48 : 96;
              removeWatermarkLocal(origData, targetSize);
              origCtx.putImageData(origData, 0, 0);
              
              // Now draw this cleaned original onto the final scaled canvas with filters
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              if (options.enhanceDetails) {
                ctx.filter = "contrast(115%) saturate(120%) brightness(105%)";
              }
              ctx.drawImage(origCanvas, 0, 0, canvas.width, canvas.height);
            }
        } catch (e) {
            console.error("Watermark removal failed:", e);
        }
      }

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Blob creation failed"));
          return;
        }
        resolve(URL.createObjectURL(blob));
        URL.revokeObjectURL(objectUrl);
      }, "image/png", 1.0);
    };
    img.onerror = (e) => reject(e);
    img.src = objectUrl;
  });
}
