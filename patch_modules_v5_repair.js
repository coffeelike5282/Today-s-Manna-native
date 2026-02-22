const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function (file) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
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
console.log(`Starting repair scan in: ${targetDir}`);
const files = getAllFiles(targetDir);
console.log(`Found ${files.length} files to check.`);

// Regex to find the pattern I introduced: "lhs = lhs ?? rhs"
// We want to wrap rhs in parentheses to avoid SyntaxError with || or &&.
const fixRegex = /([a-zA-Z0-9_.]+(?:\[[^\]]+\])?)\s*=\s*\1\s*\?\?\s*([^;]+)(;|$)/g;

let fixedCount = 0;
files.forEach(file => {
    try {
        let content = fs.readFileSync(file, 'utf8');
        if (fixRegex.test(content)) {
            console.log(`Repairing: ${file}`);
            // Reset regex index because of .test()
            fixRegex.lastIndex = 0;
            content = content.replace(fixRegex, (match, lhs, rhs, suffix) => {
                // Only add parentheses if they aren't already there or if there's a risk.
                // To be totally safe, just wrap it. (rhs) is always valid.
                return `${lhs} = ${lhs} ?? (${rhs})${suffix}`;
            });
            fs.writeFileSync(file, content, 'utf8');
            fixedCount++;
        }
    } catch (err) {
        // ignore
    }
});
console.log(`Done. Repaired ${fixedCount} files.`);
