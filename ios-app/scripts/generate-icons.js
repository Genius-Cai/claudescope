#!/usr/bin/env node
/**
 * App Icon Generator for ClaudeScope iOS
 * Generates all required icon sizes from SVG
 *
 * Usage: node scripts/generate-icons.js
 * Requires: npm install sharp
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('Installing sharp for image processing...');
  require('child_process').execSync('npm install sharp --save-dev', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });
  sharp = require('sharp');
}

const ICON_SIZES = [
  {size: 40, name: 'icon-20@2x.png'},
  {size: 60, name: 'icon-20@3x.png'},
  {size: 58, name: 'icon-29@2x.png'},
  {size: 87, name: 'icon-29@3x.png'},
  {size: 80, name: 'icon-40@2x.png'},
  {size: 120, name: 'icon-40@3x.png'},
  {size: 120, name: 'icon-60@2x.png'},
  {size: 180, name: 'icon-60@3x.png'},
  {size: 1024, name: 'icon-1024.png'},
];

const INPUT_SVG = path.join(__dirname, '../assets/app-icon.svg');
const OUTPUT_DIR = path.join(
  __dirname,
  '../ios/ClaudeScopeIOS/Images.xcassets/AppIcon.appiconset',
);

async function generateIcons() {
  console.log('Generating app icons from SVG...\n');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, {recursive: true});
  }

  // Read SVG
  const svgBuffer = fs.readFileSync(INPUT_SVG);

  // Generate each size
  for (const {size, name} of ICON_SIZES) {
    const outputPath = path.join(OUTPUT_DIR, name);

    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`  Created: ${name} (${size}x${size})`);
  }

  // Update Contents.json
  const contents = {
    images: [
      {
        filename: 'icon-20@2x.png',
        idiom: 'iphone',
        scale: '2x',
        size: '20x20',
      },
      {
        filename: 'icon-20@3x.png',
        idiom: 'iphone',
        scale: '3x',
        size: '20x20',
      },
      {
        filename: 'icon-29@2x.png',
        idiom: 'iphone',
        scale: '2x',
        size: '29x29',
      },
      {
        filename: 'icon-29@3x.png',
        idiom: 'iphone',
        scale: '3x',
        size: '29x29',
      },
      {
        filename: 'icon-40@2x.png',
        idiom: 'iphone',
        scale: '2x',
        size: '40x40',
      },
      {
        filename: 'icon-40@3x.png',
        idiom: 'iphone',
        scale: '3x',
        size: '40x40',
      },
      {
        filename: 'icon-60@2x.png',
        idiom: 'iphone',
        scale: '2x',
        size: '60x60',
      },
      {
        filename: 'icon-60@3x.png',
        idiom: 'iphone',
        scale: '3x',
        size: '60x60',
      },
      {
        filename: 'icon-1024.png',
        idiom: 'ios-marketing',
        scale: '1x',
        size: '1024x1024',
      },
    ],
    info: {
      author: 'xcode',
      version: 1,
    },
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'Contents.json'),
    JSON.stringify(contents, null, 2),
  );

  console.log('\n  Updated: Contents.json');
  console.log('\nApp icons generated successfully!');
  console.log('Rebuild the app in Xcode to see the new icon.');
}

generateIcons().catch(console.error);
