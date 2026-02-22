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

        // 1. Fix previous corruption: IDENTIFIER = (IDENTIFIER ?? {) or Similar
        // Pattern: ident = (ident ?? something)
        // We want to remove the wrapping ( and the extra ) if it was added incorrectly.
        // Actually, let's just reverse the previous patch if possible, or fix the specific (ident ?? {) case.

        const corruptedRegex = /([a-zA-Z0-9_.]+(?:\[[^\]]+\])?)\s*=\s*\(\1\s*\?\?\s*(\{)\)/g;
        if (corruptedRegex.test(content)) {
            console.log(`Fixing corrupted multi-line object in: ${file}`);
            content = content.replace(corruptedRegex, '$1 = $1 ?? $2');
            changed = true;
        }

        // 2. Safer patch for Logical Assignment ??=
        // Match: ident ??= 
        // Replace: ident = ident ?? 
        // This doesn't capture the RHS, so it won't break multi-line or add extra parents.
        const patchRegex = /([a-zA-Z0-9_.]+(?:\[[^\]]+\])?)\s*\?\?=/g;
        if (patchRegex.test(content)) {
            console.log(`Patching: ${file}`);
            content = content.replace(patchRegex, '$1 = $1 ??');
            changed = true;
        }

        if (changed) {
            fs.writeFileSync(file, content, 'utf8');
        }
    } catch (err) {
        // console.error(`Error processing ${file}: ${err.message}`);
    }
});
console.log('Done fixing and patching.');
