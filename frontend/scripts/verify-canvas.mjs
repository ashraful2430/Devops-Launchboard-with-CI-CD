import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const url = process.env.UI_URL ?? 'http://127.0.0.1:5173/';
const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

const browser = await chromium.launch();
await mkdir('screenshots', { recursive: true });

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `screenshots/${viewport.name}.png`, fullPage: true });

  const result = await page.locator('canvas').evaluate((canvas) => {
    const context = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    const width = canvas.width;
    const height = canvas.height;
    if (!context || width === 0 || height === 0) {
      return { width, height, nonZeroPixels: 0 };
    }

    const pixels = new Uint8Array(width * height * 4);
    context.readPixels(0, 0, width, height, context.RGBA, context.UNSIGNED_BYTE, pixels);

    let nonZeroPixels = 0;
    for (let index = 0; index < pixels.length; index += 4) {
      if (pixels[index] || pixels[index + 1] || pixels[index + 2] || pixels[index + 3]) {
        nonZeroPixels += 1;
      }
    }

    return { width, height, nonZeroPixels };
  });

  if (result.width < 100 || result.height < 100 || result.nonZeroPixels < 1000) {
    throw new Error(`${viewport.name} canvas did not render enough pixels: ${JSON.stringify(result)}`);
  }

  await page.close();
  console.log(`${viewport.name}: ${result.width}x${result.height}, ${result.nonZeroPixels} painted pixels`);
}

await browser.close();
