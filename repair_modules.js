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

files.forEach(file => {
    try {
        let content = fs.readFileSync(file, 'utf8');
        let changed = false;

        // Pattern: ident = (ident ?? something)
        // This was the result of my bad patch. We want to remove the ( and )
        // Regex matches the pattern and removes the added parentheses.
        // It's careful to check the identifier matches.
        const repairRegex = /([a-zA-Z0-9_.]+(?:\[[^\]]+\])?)\s*=\s*\(\1\s*\?\?\s*(.*?)\)/g;

        if (repairRegex.test(content)) {
            console.log(`Repairing: ${file}`);
            content = content.replace(repairRegex, '$1 = $1 ?? $2');
            changed = true;
        }

        if (changed) {
            fs.writeFileSync(file, content, 'utf8');
        }
    } catch (err) {
        // console.error(`Error processing ${file}: ${err.message}`);
    }
});
console.log('Done repairing node_modules.');
