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
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });

    return arrayOfFiles;
}

const files = getAllFiles('./node_modules');
console.log(`Found ${files.length} files to check.`);

files.forEach(file => {
    try {
        let content = fs.readFileSync(file, 'utf8');
        if (content.includes('??=')) {
            console.log(`Patching: ${file}`);
            // Simple regex replacement: obj.prop ??= val  =>  obj.prop = (obj.prop ?? val)
            // Handles basic property access and variables
            const newContent = content.replace(/([a-zA-Z0-9_.]+(?:\[[^\]]+\])?)\s*\?\?=\s*([^;,\n]+)/g, (match, p1, p2) => {
                return `${p1} = (${p1} ?? ${p2})`;
            });
            fs.writeFileSync(file, newContent, 'utf8');
        }
    } catch (err) {
        // console.error(`Error processing ${file}: ${err.message}`);
    }
});
console.log('Done patching.');
