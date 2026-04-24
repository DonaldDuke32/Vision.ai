import { getEmbeddedAlphaMap } from "./alphaMaps";

// Constants definition
const ALPHA_NOISE_FLOOR = 3 / 255;
const ALPHA_THRESHOLD = 0.002;
const MAX_ALPHA = 0.99;
const LOGO_VALUE = 255;

export function removeWatermarkLocal(imageData: ImageData, targetSize: number = 96) {
    const alphaMap = getEmbeddedAlphaMap(targetSize);
    if (!alphaMap) return;

    const width = targetSize;
    const height = targetSize;
    
    // Identify bottom right corner (32px padding based on configs)
    // Actually the standard config says:
    // 48px: marginRight 32, marginBottom 32
    // 96px: marginRight 64, marginBottom 64
    const config = targetSize === 96 
        ? { logoSize: 96, marginRight: 64, marginBottom: 64 } 
        : { logoSize: 48, marginRight: 32, marginBottom: 32 };
        
    const x = imageData.width - config.marginRight - config.logoSize;
    const y = imageData.height - config.marginBottom - config.logoSize;

    if (x < 0 || y < 0) return; // image too small

    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const imgIdx = ((y + row) * imageData.width + (x + col)) * 4;
            const alphaIdx = row * width + col;
            const rawAlpha = alphaMap[alphaIdx];

            const signalAlpha = Math.max(0, rawAlpha - ALPHA_NOISE_FLOOR);

            if (signalAlpha < ALPHA_THRESHOLD) {
                continue;
            }

            const alpha = Math.min(rawAlpha, MAX_ALPHA);
            const oneMinusAlpha = 1.0 - alpha;

            for (let c = 0; c < 3; c++) {
                const watermarked = imageData.data[imgIdx + c];
                const original = (watermarked - alpha * LOGO_VALUE) / oneMinusAlpha;
                imageData.data[imgIdx + c] = Math.max(0, Math.min(255, Math.round(original)));
            }
        }
    }
}
