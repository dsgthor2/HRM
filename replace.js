const fs = require('fs');
const path = require('path');

const directories = ['backend/src', 'backend/prisma', 'backend/scripts', 'frontend'];
const extensions = ['.js', '.ts', '.tsx', '.json', '.prisma', '.css', '.html', '.md', '.cjs', '.mjs'];
const processed = new Set();

function processDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (['node_modules', '.next', 'out', '.git', '.gemini'].includes(file)) continue;
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else {
            if (processed.has(fullPath)) continue;
            processed.add(fullPath);
            if (extensions.some(ext => fullPath.endsWith(ext))) {
                let content = fs.readFileSync(fullPath, 'utf8');
                let newContent = content;
                
                newContent = newContent.replace(/Fingrow Consulting services\\nprivate limited/gi, "DefenseBlu\\nPrivate Limited");
                newContent = newContent.replace(/Fingrow Consulting services private limited/gi, "DefenseBlu Private Limited");
                newContent = newContent.replace(/Fingrow Consulting Services Pvt Ltd/gi, "DefenseBlu Private Limited");
                newContent = newContent.replace(/Fingrow Consulting Services/gi, "DefenseBlu");
                newContent = newContent.replace(/Fingrow HRMS/gi, "DefenseBlu HRMS");
                newContent = newContent.replace(/Fingrow HR/gi, "DefenseBlu HR");
                newContent = newContent.replace(/lokesh\.vasuz?@fingrow\.in/gi, "hr@defenseblu.com");
                newContent = newContent.replace(/admin@fingrow\.in/gi, "admin@defenseblu.com");
                newContent = newContent.replace(/@fingrow\.in/gi, "@defenseblu.com");
                newContent = newContent.replace(/fingrow\.in/gi, "defenseblu.com");
                newContent = newContent.replace(/fingrow-hrms/gi, "defenseblu-hrms");
                newContent = newContent.replace(/Fingrow/g, "DefenseBlu");
                newContent = newContent.replace(/fingrow/g, "defenseblu");

                if (content !== newContent) {
                    fs.writeFileSync(fullPath, newContent);
                    console.log(`Updated ${fullPath}`);
                }
            }
        }
    }
}

directories.forEach(processDir);
processDir('backend');
console.log("Done");
