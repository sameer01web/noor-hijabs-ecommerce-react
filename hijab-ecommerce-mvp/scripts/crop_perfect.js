import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function cropAllPerfect() {
  const sourceImage = 'C:/Users/Sameer Shaikh/.gemini/antigravity-ide/brain/1a511e22-be92-4821-b540-a8101dd54f0c/scratch/downloaded_image.png';
  const outDir = path.resolve('public/images');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Copy full catalog
  fs.copyFileSync(sourceImage, path.join(outDir, 'noor_catalog_overview.png'));

  // 6 Columns for Rows 1, 2, 3
  const cols6 = [
    { x1: 5, x2: 203 },
    { x1: 215, x2: 411 },
    { x1: 424, x2: 620 },
    { x1: 633, x2: 829 },
    { x1: 842, x2: 1038 },
    { x1: 1051, x2: 1248 }
  ];

  // Row 1: Hijabs (Clean portrait)
  const row1Names = [
    'plain-black-hijab',
    'vintage-printed-floral-hijab',
    'chiffon-nude-sand-hijab',
    'georgette-navy-blue-hijab',
    'cotton-sage-green-hijab',
    'silk-rose-pink-hijab'
  ];

  for (let i = 0; i < 6; i++) {
    const col = cols6[i];
    const width = col.x2 - col.x1;

    // Clean image
    await sharp(sourceImage)
      .extract({ left: col.x1, top: 8, width, height: 302 })
      .toFile(path.join(outDir, `${row1Names[i]}.png`));

    // Card with pill
    await sharp(sourceImage)
      .extract({ left: col.x1, top: 8, width, height: 348 })
      .toFile(path.join(outDir, `${row1Names[i]}-card.png`));

    console.log(`Saved R1 ${row1Names[i]}`);
  }

  // Row 2: Fabrics
  const row2Names = [
    'fabric-chiffon',
    'fabric-georgette',
    'fabric-cotton',
    'fabric-silk',
    'fabric-crinkle',
    'fabric-embroidered'
  ];

  for (let i = 0; i < 6; i++) {
    const col = cols6[i];
    const width = col.x2 - col.x1;

    // Clean image
    await sharp(sourceImage)
      .extract({ left: col.x1, top: 378, width, height: 150 })
      .toFile(path.join(outDir, `${row2Names[i]}.png`));

    // Card with pill
    await sharp(sourceImage)
      .extract({ left: col.x1, top: 378, width, height: 194 })
      .toFile(path.join(outDir, `${row2Names[i]}-card.png`));

    console.log(`Saved R2 ${row2Names[i]}`);
  }

  // Row 3: Specialty Hijabs
  const row3Names = [
    'jacquard-woven-gold-hijab',
    'pearl-embellished-black-hijab',
    'ombre-gradient-mauve-hijab',
    'emerald-green-pinned-hijab',
    'modest-style-grey-hijab',
    'layered-mauve-hijab'
  ];

  for (let i = 0; i < 6; i++) {
    const col = cols6[i];
    const width = col.x2 - col.x1;

    // Clean image
    await sharp(sourceImage)
      .extract({ left: col.x1, top: 622, width, height: 254 })
      .toFile(path.join(outDir, `${row3Names[i]}.png`));

    // Card with pill
    await sharp(sourceImage)
      .extract({ left: col.x1, top: 622, width, height: 298 })
      .toFile(path.join(outDir, `${row3Names[i]}-card.png`));

    console.log(`Saved R3 ${row3Names[i]}`);
  }

  // Row 4: 5 Collections & Features
  const cols5 = [
    { x1: 5, x2: 242 },
    { x1: 254, x2: 492 },
    { x1: 504, x2: 742 },
    { x1: 753, x2: 994 },
    { x1: 1006, x2: 1248 }
  ];

  const row4Names = [
    'feature-color-palette',
    'feature-unique-patterns',
    'feature-sizes-lengths',
    'feature-noor-gift-packaging',
    'feature-occasions-styling'
  ];

  for (let i = 0; i < 5; i++) {
    const col = cols5[i];
    const width = col.x2 - col.x1;

    // Clean image
    await sharp(sourceImage)
      .extract({ left: col.x1, top: 948, width, height: 228 })
      .toFile(path.join(outDir, `${row4Names[i]}.png`));

    // Card with pill
    await sharp(sourceImage)
      .extract({ left: col.x1, top: 948, width, height: 274 })
      .toFile(path.join(outDir, `${row4Names[i]}-card.png`));

    console.log(`Saved R4 ${row4Names[i]}`);
  }

  console.log('All images updated with border-free precision!');
}

cropAllPerfect().catch(console.error);
