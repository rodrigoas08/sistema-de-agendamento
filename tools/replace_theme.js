const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = [...walkDir('app'), ...walkDir('components')];
let changedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('[#e63946]')) {
        content = content.replace(/\[#e63946\]/g, 'primary');
        fs.writeFileSync(file, content);
        changedFiles++;
    }
});

console.log(`Updated ${changedFiles} files with bg-primary/text-primary instead of hardcoded hex.`);
