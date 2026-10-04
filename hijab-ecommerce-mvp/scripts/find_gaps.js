import sharp from 'sharp';
import fs from 'fs';

async function findRowGaps() {
  const sourceImage = 'C:/Users/Sameer Shaikh/.gemini/antigravity-ide/brain/1a511e22-be92-4821-b540-a8101dd54f0c/scratch/downloaded_image.png';
  const { data, info } = await sharp(sourceImage).raw().toBuffer({ resolveWithObject: true });

  const W = info.width;
  const H = info.height;
  const channels = info.channels;

  // Let's print out what is at different Y coordinates along center x (W / 2)
  // Let's find white/pink/beige lines or pill borders
  console.log(`Image info: ${W}x${H}, channels: ${channels}`);

  // Let's sample rows from y = 0 to 1254 in steps of 10 to see where rows begin and end
  for (let y = 0; y < H; y += 15) {
    let r = 0, g = 0, b = 0;
    for (let x = 0; x < W; x++) {
      const idx = (y * W + x) * channels;
      r += data[idx];
      g += data[idx + 1];
      b += data[idx + 2];
    }
    r = Math.round(r / W);
    g = Math.round(g / W);
    b = Math.round(b / W);
    if (y % 30 === 0) {
      console.log(`y=${y}: avg RGB=(${r}, ${g}, ${b})`);
    }
  }
}

findRowGaps().catch(console.error);
