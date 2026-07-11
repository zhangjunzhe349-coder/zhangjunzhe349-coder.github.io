const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, 'public', 'images');
const files = fs.readdirSync(imagesDir);

async function compress() {
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg') continue;

    const inputPath = path.join(imagesDir, file);
    const outputName = path.basename(file, ext) + '.jpg';
    const outputPath = path.join(imagesDir, outputName);

    const stats = fs.statSync(inputPath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

    try {
      const image = await Jimp.read(inputPath);
      image.cover(800, 450);
      image.quality(80);
      await image.writeAsync(outputPath);

      const newStats = fs.statSync(outputPath);
      const newSizeMB = (newStats.size / 1024 / 1024).toFixed(2);

      if (inputPath !== outputPath) {
        fs.unlinkSync(inputPath);
      }

      console.log(`${file}: ${sizeMB}MB → ${outputName}: ${newSizeMB}MB`);
    } catch (err) {
      console.error(`Failed to process ${file}:`, err.message);
    }
  }
}

compress().catch(console.error);
