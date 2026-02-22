const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            if (file !== 'node_modules' || dirPath === './node_modules') {
                arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
            }
        } else {
            if (file.endsWith('.js') || file.endsWith('.ts')) {
                arrayOfFiles.push(path.join(dirPath, file));
            }
        }
    });

    return arrayOfFiles;
}

const files = getAllFiles('./node_modules');
console.log(`Found ${files.length} files to check.`);

// Safe Regex: Only replaces the operator, preserves the rest of the code.
// No wrapping parentheses = No mismatch risk.
const patchRegex = /([a-zA-Z0-9_.]+(?:\[[^\]]+\])?)\s*\?\?=\s*/g;

files.forEach(file => {
    try {
        let content = fs.readFileSync(file, 'utf8');
        if (patchRegex.test(content)) {
            console.log(`Patching: ${file}`);
            content = content.replace(patchRegex, (match, lhs) => {
                return `${lhs} = ${lhs} ?? `;
            });
            fs.writeFileSync(file, content, 'utf8');
        }
    } catch (err) {
        // ignore errors
    }
});
console.log('Done safe-patching.');
