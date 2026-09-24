const fs = require('fs');
const path = require('path');

function rgbaToHex(r, g, b, a) {
    const rHex = parseInt(r, 10).toString(16).padStart(2, '0');
    const gHex = parseInt(g, 10).toString(16).padStart(2, '0');
    const bHex = parseInt(b, 10).toString(16).padStart(2, '0');
    let aHex = '';
    if (a !== undefined) {
        aHex = Math.round(parseFloat(a) * 255).toString(16).padStart(2, '0');
    }
    return `#${rHex}${gHex}${bHex}${aHex}`;
}

function convertColorsInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Convert rgba(r, g, b, a)
    let modified = content.replace(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/g, (match, r, g, b, a) => {
        return rgbaToHex(r, g, b, a);
    });

    if (content !== modified) {
        fs.writeFileSync(filePath, modified, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.css')) {
            convertColorsInFile(fullPath);
        }
    }
}

walkDir(path.join(__dirname, 'src'));
