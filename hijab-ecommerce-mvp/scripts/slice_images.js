import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function processImages() {
  const sourceImage = 'C:/Users/Sameer Shaikh/.gemini/antigravity-ide/brain/1a511e22-be92-4821-b540-a8101dd54f0c/scratch/downloaded_image.png';
  const outDir = path.resolve('public/images');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const meta = await sharp(sourceImage).metadata();
  console.log('Image dimensions:', meta.width, 'x', meta.height);

  // Copy full catalog image to public
  fs.copyFileSync(sourceImage, path.join(outDir, 'noor_hijabs_master_catalog.png'));

  // Calculate coordinates for 4 rows:
  // The master image has 4 rows.
  // Let's inspect the exact layout.
  // Row 1: 6 columns (Hijab styles)
  // Row 2: 6 columns (Fabrics)
  // Row 3: 6 columns (Specialty styles)
  // Row 4: 5 columns (Features & Packaging)

  const W = meta.width;
  const H = meta.height;

  // Let's crop each row and individual items:
  // Heights of rows: each row is roughly H / 4
  const rowH = Math.floor(H / 4);

  // Row 1 items (6 columns)
  const row1Names = [
    'plain_black_hijab',
    'vintage_printed_chiffon_hijab',
    'nude_beige_chiffon_hijab',
    'navy_georgette_hijab',
    'sage_green_cotton_hijab',
    'rose_pink_silk_hijab'
  ];

  for (let i = 0; i < 6; i++) {
    const colW = Math.floor(W / 6);
    const left = i * colW;
    const top = 0;
    const width = (i === 5) ? W - left : colW;
    const height = rowH;

    await sharp(sourceImage)
      .extract({ left, top, width, height })
      .toFile(path.join(outDir, `${row1Names[i]}.png`));
    console.log(`Saved Row 1 item ${i}: ${row1Names[i]}.png`);
  }

  // Row 2 items (6 columns - Fabrics)
  const row2Names = [
    'fabric_chiffon_weave',
    'fabric_georgette_texture',
    'fabric_cotton_voile',
    'fabric_silk_satin',
    'fabric_crinkle_crepe',
    'fabric_embroidered_lace'
  ];

  for (let i = 0; i < 6; i++) {
    const colW = Math.floor(W / 6);
    const left = i * colW;
    const top = rowH;
    const width = (i === 5) ? W - left : colW;
    const height = rowH;

    await sharp(sourceImage)
      .extract({ left, top, width, height })
      .toFile(path.join(outDir, `${row2Names[i]}.png`));
    console.log(`Saved Row 2 item ${i}: ${row2Names[i]}.png`);
  }

  // Row 3 items (6 columns - Specialty styles)
  const row3Names = [
    'jacquard_woven_hijab',
    'pearl_beaded_hijab',
    'ombre_gradient_hijab',
    'emerald_hijab_with_pins',
    'modest_style_grey_hijab',
    'layered_mauve_hijab'
  ];

  for (let i = 0; i < 6; i++) {
    const colW = Math.floor(W / 6);
    const left = i * colW;
    const top = rowH * 2;
    const width = (i === 5) ? W - left : colW;
    const height = rowH;

    await sharp(sourceImage)
      .extract({ left, top, width, height })
      .toFile(path.join(outDir, `${row3Names[i]}.png`));
    console.log(`Saved Row 3 item ${i}: ${row3Names[i]}.png`);
  }

  // Row 4 items (5 columns - Features & Packaging)
  const row4Names = [
    'colors_palette_collection',
    'unique_patterns_collection',
    'different_sizes_lengths',
    'premium_box_packaging',
    'everyday_to_occasions_styling'
  ];

  for (let i = 0; i < 5; i++) {
    const colW = Math.floor(W / 5);
    const left = i * colW;
    const top = rowH * 3;
    const width = (i === 4) ? W - left : colW;
    const height = H - top;

    await sharp(sourceImage)
      .extract({ left, top, width, height })
      .toFile(path.join(outDir, `${row4Names[i]}.png`));
    console.log(`Saved Row 4 item ${i}: ${row4Names[i]}.png`);
  }

  console.log('All images sliced and saved into public/images successfully!');
}

processImages().catch(err => console.error('Processing error:', err));
