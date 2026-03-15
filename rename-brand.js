
const fs = require('fs');
const path = require('path');

const TARGET_DIR = path.join(__dirname);
const IGNORE_DIRS = ['node_modules', '.git', '.next'];
const TEXT_TO_REPLACE = [
    { from: /DMTrack/g, to: 'DMTrack' },
    { from: /dmtrack/g, to: 'dmtrack' }
];

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (IGNORE_DIRS.includes(file)) continue;
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            walk(filePath);
        } else if (stat.isFile()) {
            // Only process text files
            if (!filePath.match(/\.(js|jsx|ts|tsx|html|css|json|md|bat)$/)) continue;
            
            let content = fs.readFileSync(filePath, 'utf8');
            let updated = false;
            
            for (const {from, to} of TEXT_TO_REPLACE) {
                if (content.match(from)) {
                    content = content.replace(from, to);
                    updated = true;
                }
            }
            
            if (updated) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log('Updated:', filePath.replace(__dirname, ''));
            }
        }
    }
}

console.log('Starting rename from DMTrack to DMTrack...');
walk(TARGET_DIR);
console.log('Finished rename!');

