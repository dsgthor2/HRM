const sharp = require('sharp');
const fs = require('fs');

const inputPath = 'C:\\Users\\dheel\\.gemini\\antigravity\\brain\\ccf78b8a-be69-4a0b-8805-dbd73091b499\\defenseblu_app_icon_1781356620195.png';
const out192 = 'public/icons/icon-192x192.png';
const out512 = 'public/icons/icon-512x512.png';
const outMaskable = 'public/icons/icon-maskable-512x512.png';
const outFavicon = 'public/favicon.ico';

async function generate() {
  if (!fs.existsSync(inputPath)) {
    console.log('Source file missing!');
    return;
  }
  
  await sharp(inputPath)
    .resize(192, 192)
    .toFile(out192);
    
  await sharp(inputPath)
    .resize(512, 512)
    .toFile(out512);

  await sharp(inputPath)
    .resize(512, 512)
    .toFile(outMaskable);

  await sharp(inputPath)
    .resize(32, 32)
    .toFile(outFavicon);
    
  console.log('Icons generated successfully.');
}

generate();
