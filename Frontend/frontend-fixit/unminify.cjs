const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'pages', 'UserLocationMapPage', 'UserLocationMapPage.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Basic unminify
css = css.replace(/\{/g, ' {\n  ');
css = css.replace(/\}/g, '\n}\n\n');
css = css.replace(/;/g, ';\n  ');
css = css.replace(/,\./g, ',\n.');
// Fix empty rules or double spaces
css = css.replace(/  \n/g, '');

fs.writeFileSync(cssPath, css, 'utf8');
console.log('Unminified CSS');
