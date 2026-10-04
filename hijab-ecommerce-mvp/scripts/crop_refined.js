import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function cropRefined() {
  const sourceImage = 'C:/Users/Sameer Shaikh/.gemini/antigravity-ide/brain/1a511e22-be92-4821-b540-a8101dd54f0c/scratch/downloaded_image.png';
  const outDir = path.resolve('public/images');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const meta = await sharp(sourceImage).metadata();
  const W = meta.width; // 1254
  const H = meta.height; // 1254

  console.log(`Total master image: ${W}x${H}`);

  // In the 1254x1254 image:
  // There are 4 distinct horizontal tiers:
  // Row 0 (Hijab Portraits 1): Top ~6px to ~360px
  // Row 1 (Fabric Textures): ~370px to ~555px
  // Row 2 (Hijab Portraits 2): ~565px to ~920px
  // Row 3 (Features & Box): ~930px to ~1250px

  // Let's create an auto-detection or precise slice definitions:
  // Let's define the precise box coordinates for each item:

  // Row 1: 6 columns of portraits
  // Columns:
  // Col 0: x: 0 to 207
  // Col 1: x: 212 to 418
  // Col 2: x: 423 to 628
  // Col 3: x: 633 to 838
  // Col 4: x: 843 to 1048
  // Col 5: x: 1053 to 1254

  // Let's calculate portrait crop (cropping out the bottom text pill for clean product photos, or keeping it):
  // Let's generate both: clean model portrait (without text pill) and with text pill!

  const portraitsR1 = [
    { name: 'plain-black-hijab', label: 'Plain Black Hijab', x1: 0, x2: 206, y1: 5, y2: 365, textY: 315 },
    { name: 'printed-floral-chiffon-hijab', label: 'Vintage Printed Chiffon Hijab', x1: 213, x2: 416, y1: 5, y2: 365, textY: 315 },
    { name: 'chiffon-nude-sand-hijab', label: 'Classic Nude Chiffon Hijab', x1: 423, x2: 625, y1: 5, y2: 365, textY: 315 },
    { name: 'georgette-navy-blue-hijab', label: 'Matte Navy Georgette Hijab', x1: 632, x2: 835, y1: 5, y2: 365, textY: 315 },
    { name: 'cotton-sage-green-hijab', label: 'Pure Sage Turkish Cotton Hijab', x1: 842, x2: 1045, y1: 5, y2: 365, textY: 315 },
    { name: 'silk-rose-pink-hijab', label: 'Mulberry Rose Silk Hijab', x1: 1052, x2: 1254, y1: 5, y2: 365, textY: 315 }
  ];

  for (const p of portraitsR1) {
    // Full cell with pill
    await sharp(sourceImage)
      .extract({ left: p.x1, top: p.y1, width: p.x2 - p.x1, height: p.y2 - p.y1 })
      .toFile(path.join(outDir, `${p.name}-card.png`));

    // Clean product photo (without text pill at bottom)
    const cleanH = p.textY - p.y1;
    await sharp(sourceImage)
      .extract({ left: p.x1, top: p.y1, width: p.x2 - p.x1, height: cleanH })
      .toFile(path.join(outDir, `${p.name}.png`));

    console.log(`Exported R1: ${p.name}`);
  }

  // Row 2: 6 fabric swatches (Row height ~ 375 to 555)
  const fabrics = [
    { name: 'fabric-chiffon', x1: 0, x2: 206, y1: 375, y2: 555, textY: 510 },
    { name: 'fabric-georgette', x1: 213, x2: 416, y1: 375, y2: 555, textY: 510 },
    { name: 'fabric-cotton', x1: 423, x2: 625, y1: 375, y2: 555, textY: 510 },
    { name: 'fabric-silk', x1: 632, x2: 835, y1: 375, y2: 555, textY: 510 },
    { name: 'fabric-crinkle', x1: 842, x2: 1045, y1: 375, y2: 555, textY: 510 },
    { name: 'fabric-embroidered', x1: 1052, x2: 1254, y1: 375, y2: 555, textY: 510 }
  ];

  for (const f of fabrics) {
    await sharp(sourceImage)
      .extract({ left: f.x1, top: f.y1, width: f.x2 - f.x1, height: f.y2 - f.y1 })
      .toFile(path.join(outDir, `${f.name}-card.png`));

    const cleanH = f.textY - f.y1;
    await sharp(sourceImage)
      .extract({ left: f.x1, top: f.y1, width: f.x2 - f.x1, height: cleanH })
      .toFile(path.join(outDir, `${f.name}.png`));

    console.log(`Exported Fabric: ${f.name}`);
  }

  // Row 3: 6 Specialty Hijabs (y: 565 to 925)
  const portraitsR3 = [
    { name: 'jacquard-woven-gold-hijab', x1: 0, x2: 206, y1: 565, y2: 925, textY: 875 },
    { name: 'pearl-embellished-black-hijab', x1: 213, x2: 416, y1: 565, y2: 925, textY: 875 },
    { name: 'ombre-gradient-mauve-hijab', x1: 423, x2: 625, y1: 565, y2: 925, textY: 875 },
    { name: 'emerald-green-pinned-hijab', x1: 632, x2: 835, y1: 565, y2: 925, textY: 875 },
    { name: 'modest-style-grey-hijab', x1: 842, x2: 1045, y1: 565, y2: 925, textY: 875 },
    { name: 'layered-mauve-hijab', x1: 1052, x2: 1254, y1: 565, y2: 925, textY: 875 }
  ];

  for (const p of portraitsR3) {
    await sharp(sourceImage)
      .extract({ left: p.x1, top: p.y1, width: p.x2 - p.x1, height: p.y2 - p.y1 })
      .toFile(path.join(outDir, `${p.name}-card.png`));

    const cleanH = p.textY - p.y1;
    await sharp(sourceImage)
      .extract({ left: p.x1, top: p.y1, width: p.x2 - p.x1, height: cleanH })
      .toFile(path.join(outDir, `${p.name}.png`));

    console.log(`Exported R3: ${p.name}`);
  }

  // Row 4: 5 Features (y: 935 to 1250)
  // 5 columns:
  // Col 0: 0 to 245
  // Col 1: 250 to 495
  // Col 2: 500 to 745
  // Col 3: 750 to 1015 (Packaging Box)
  // Col 4: 1020 to 1254
  const featuresR4 = [
    { name: 'feature-color-palette', x1: 0, x2: 245, y1: 935, y2: 1250, textY: 1195 },
    { name: 'feature-unique-patterns', x1: 252, x2: 494, y1: 935, y2: 1250, textY: 1195 },
    { name: 'feature-sizes-lengths', x1: 501, x2: 742, y1: 935, y2: 1250, textY: 1180 },
    { name: 'feature-noor-gift-packaging', x1: 748, x2: 1012, y1: 935, y2: 1250, textY: 1195 },
    { name: 'feature-occasions-styling', x1: 1018, x2: 1254, y1: 935, y2: 1250, textY: 1180 }
  ];

  for (const f of featuresR4) {
    await sharp(sourceImage)
      .extract({ left: f.x1, top: f.y1, width: f.x2 - f.x1, height: f.y2 - f.y1 })
      .toFile(path.join(outDir, `${f.name}-card.png`));

    const cleanH = f.textY - f.y1;
    await sharp(sourceImage)
      .extract({ left: f.x1, top: f.y1, width: f.x2 - f.x1, height: cleanH })
      .toFile(path.join(outDir, `${f.name}.png`));

    console.log(`Exported R4 Feature: ${f.name}`);
  }

  console.log('All refined crops generated successfully!');
}

cropRefined().catch(console.error);
