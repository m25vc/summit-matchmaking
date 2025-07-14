import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read the index.html from dist
const indexPath = path.join(__dirname, '../dist/index.html');
const outputPath = path.join(__dirname, '../dist/404.html');

// Check if dist exists and has index.html
if (!fs.existsSync(indexPath)) {
  console.error('Error: dist/index.html not found. Please run "npm run build" first.');
  process.exit(1);
}

// Copy index.html to 404.html
fs.copyFileSync(indexPath, outputPath);
console.log('Successfully created 404.html for client-side routing on GitHub Pages');