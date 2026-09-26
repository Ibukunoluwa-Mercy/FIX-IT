const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname);
const dirsToScan = [
  path.join(root, 'Backend'),
  path.join(root, 'Frontend', 'frontend-fixit')
];

const ignoredFolders = new Set(['node_modules', 'dist', '.git', 'coverage', '.cache']);
const allowedExts = new Set(['.js', '.jsx', '.css', '.ts', '.tsx', '.json', '.html']);

const over300 = [];

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!ignoredFolders.has(entry.name)) {
        scanDir(path.join(dir, entry.name));
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (allowedExts.has(ext) && entry.name !== 'package-lock.json') {
        const fullPath = path.join(dir, entry.name);
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n').length;
        if (lines > 300) {
          over300.push({ file: path.relative(root, fullPath), lines });
        }
      }
    }
  }
}

for (const dir of dirsToScan) {
  if (fs.existsSync(dir)) {
    scanDir(dir);
  }
}

if (over300.length === 0) {
  console.log('SUCCESS: All files in Frontend and Backend are 300 lines or less!');
} else {
  console.log(`Found ${over300.length} files over 300 lines:`);
  over300.sort((a, b) => b.lines - a.lines);
  for (const item of over300) {
    console.log(`- ${item.file} (${item.lines} lines)`);
  }
}
