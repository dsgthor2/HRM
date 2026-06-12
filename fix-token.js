const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file === 'node_modules' || file === '.next' || file === 'out') continue;
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes("localStorage.getItem('token')") || content.includes('localStorage.getItem("token")')) {
        let newContent = content.replace(/localStorage\.getItem\('token'\)/g, "localStorage.getItem('fg_token')");
        newContent = newContent.replace(/localStorage\.getItem\("token"\)/g, 'localStorage.getItem("fg_token")');
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log('Fixed ' + fullPath);
      }
    }
  }
}

processDir('x:\\\\Projects for now\\\\HRM-main\\\\frontend');
