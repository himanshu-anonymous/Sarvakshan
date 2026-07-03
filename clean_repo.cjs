const fs = require('fs');
const path = require('path');

// Target words and authors to replace
const SEARCH_TERMS = [
  /Aditya and Mankshu/gi, 
  /Aditya and Mankshu/gi, 
  /Aditya and Mankshu/gi, 
  /Aditya and Mankshu/gi, 
  /titmitna@gmail\.com/gi, 
  /matthewdski@gmail\.com/gi, 
  /mmyacdyy6g@163\.com/gi,
  /Aditya and Mankshu/gi, 
  /ai@worldwideview\.dev/gi,
  /Aditya and Mankshu/g
];

const COPYRIGHT_HEADER = `/*\n * Copyright (c) 2026 Aditya and Mankshu. All rights reserved.\n * This code is the exclusive property of Aditya and Mankshu.\n */\n\n`;

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    // Skip unneeded or binary folders to speed up and prevent corruption
    if (['node_modules', '.git', '.next', 'public', '.dist', '.vscode', '.github'].includes(file)) continue;
    
    const fullPath = path.join(dir, file);
    let stat;
    try {
        stat = fs.statSync(fullPath);
    } catch(e) { continue; }

    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (stat.isFile()) {
      const ext = path.extname(file);
      // Determine what files get the copyright header
      const isSource = ['.ts', '.tsx', '.js', '.jsx', '.css'].includes(ext);

      try {
        let content = fs.readFileSync(fullPath, 'utf8');
        let modified = false;

        // Replace any mention of other authors
        SEARCH_TERMS.forEach(term => {
          if (content.match(term)) {
            content = content.replace(term, 'Aditya and Mankshu');
            modified = true;
          }
        });

        // Prepend copyright header if it's a source code file
        if (isSource && !content.includes('Copyright (c) 2026 Aditya and Mankshu')) {
          content = COPYRIGHT_HEADER + content;
          modified = true;
        }

        if (modified) {
          fs.writeFileSync(fullPath, content);
          console.log(`Processed: ${fullPath}`);
        }
      } catch (e) {
        // Skip unreadable files or binaries
      }
    }
  }
}

console.log("Starting repository rewrite...");
processDir(__dirname);
console.log("Finished rewriting files.");
