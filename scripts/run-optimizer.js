// Script to run the image optimizer
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file path (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the optimizer script
const optimizerPath = path.join(__dirname, 'optimize-images.js');

console.log('Starting image optimization...');

// Run the optimizer script
const optimizer = spawn('node', [optimizerPath], { stdio: 'inherit' });

optimizer.on('close', (code) => {
  if (code === 0) {
    console.log('Image optimization completed successfully!');
  } else {
    console.error(`Image optimization failed with code ${code}`);
    process.exit(code);
  }
});