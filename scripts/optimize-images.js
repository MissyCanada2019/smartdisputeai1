import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

// Get the current file path (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths configuration
const sourceDirs = [
  path.join(__dirname, '../client/public/images'),
  path.join(__dirname, '../client/src/assets/images'),
  path.join(__dirname, '../attached_assets'),
];
const outputDir = path.join(__dirname, '../client/public/images/optimized');

// Output format options
const webpOptions = {
  quality: 80,
  lossless: false,
  effort: 4
};

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`Created directory: ${outputDir}`);
}

// Process all images in the source directory
async function optimizeImages() {
  console.log('Starting image optimization...');
  let counter = { processed: 0, skipped: 0, failed: 0 };

  // Process all source directories
  for (const sourceDir of sourceDirs) {
    if (!fs.existsSync(sourceDir)) {
      console.log(`Source directory does not exist: ${sourceDir}`);
      continue;
    }

    // Get all files in the source directory
    const files = await fs.promises.readdir(sourceDir);
    
    for (const file of files) {
      const sourcePath = path.join(sourceDir, file);
      const stats = await fs.promises.stat(sourcePath);
      
      // Skip directories
      if (stats.isDirectory()) continue;
      
      // Process only image files
      const extension = path.extname(file).toLowerCase();
      if (!['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(extension)) {
        continue;
      }
      
      // Skip SVG files - they're already optimized as vector graphics
      if (extension === '.svg') {
        console.log(`Skipping SVG file (already vector): ${file}`);
        counter.skipped++;
        continue;
      }
      
      const filename = path.basename(file, extension);
      const webpOutputPath = path.join(outputDir, `${filename}.webp`);
      
      // Skip if WebP version already exists and is newer than source
      if (fs.existsSync(webpOutputPath)) {
        const outputStats = await fs.promises.stat(webpOutputPath);
        if (outputStats.mtime > stats.mtime) {
          console.log(`Skipping ${file} (already processed)`);
          counter.skipped++;
          continue;
        }
      }
      
      try {
        // Convert to WebP
        await sharp(sourcePath)
          .webp(webpOptions)
          .toFile(webpOutputPath);
        
        // Generate responsive versions for larger images (if needed)
        if (stats.size > 100 * 1024) { // If larger than 100KB
          // For example, you could generate 480px, 768px, and 1024px versions
          // Implement this if needed
        }
        
        console.log(`Optimized: ${file} -> ${path.basename(webpOutputPath)}`);
        counter.processed++;
      } catch (error) {
        console.error(`Failed to optimize ${file}: ${error.message}`);
        counter.failed++;
      }
    }
  }

  console.log('\nOptimization complete!');
  console.log(`Processed: ${counter.processed}`);
  console.log(`Skipped: ${counter.skipped}`);
  console.log(`Failed: ${counter.failed}`);
}

// Run the optimization
optimizeImages().catch(error => {
  console.error('Error during image optimization:', error);
  process.exit(1);
});