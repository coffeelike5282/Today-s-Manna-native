const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            // Recursively walk into ALL directories, including nested node_modules
            arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else {
            if (file.endsWith('.js') || file.endsWith('.ts')) {
                arrayOfFiles.push(fullPath);
            }
        }
    });

    return arrayOfFiles;
}

const targetDir = path.join(process.cwd(), 'node_modules');
console.log(`Starting global scan in: ${targetDir}`);
const files = getAllFiles(targetDir);
console.log(`Found ${files.length} files to check.`);

const patchRegex = /([a-zA-Z0-9_.]+(?:\[[^\]]+\])?)\s*\?\?=\s*/g;

let patchedCount = 0;
files.forEach(file => {
    try {
        let content = fs.readFileSync(file, 'utf8');
        if (patchRegex.test(content)) {
            console.log(`Patching: ${file}`);
            content = content.replace(patchRegex, (match, lhs) => {
                return `${lhs} = ${lhs} ?? `;
            });
            fs.writeFileSync(file, content, 'utf8');
            patchedCount++;
        }
    } catch (err) {
        // ignore
    }
});
console.log(`Done. Patched ${patchedCount} files.`);
