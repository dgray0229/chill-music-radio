const fs = require('fs');
const path = require('path');

const PKG = 'expo-modules-core';
const VERSION = '57.0.1';
const PATCH_FILE = path.join(__dirname, '..', '.patches', `${PKG}+${VERSION}.patch`);
const TARGET_DIR = path.join(__dirname, '..', 'node_modules', 'expo', 'node_modules', PKG);

if (!fs.existsSync(PATCH_FILE)) {
  console.log(`[postinstall] No patch found for ${PKG} (nested)`);
  process.exit(0);
}

if (!fs.existsSync(TARGET_DIR)) {
  console.log(`[postinstall] Target directory not found: ${TARGET_DIR}`);
  process.exit(0);
}

const patchContent = fs.readFileSync(PATCH_FILE, 'utf-8');
const filesToCreate = [];
let currentFile = null;
let currentContent = [];

for (const line of patchContent.split('\n')) {
  if (line.startsWith('diff --git')) {
    if (currentFile) {
      filesToCreate.push({ path: currentFile, content: currentContent.join('\n') });
    }
    const match = line.match(/b\/(.+)$/);
    currentFile = match ? match[1] : null;
    currentContent = [];
  } else if (line.startsWith('+++ b/') || line.startsWith('--- a/') || line.startsWith('new file mode') || line.startsWith('index ')) {
    continue;
  } else {
    if (currentFile && !line.startsWith('@@ ')) {
      currentContent.push(line);
    }
  }
}
if (currentFile) {
  filesToCreate.push({ path: currentFile, content: currentContent.join('\n') });
}

let created = 0;
for (const file of filesToCreate) {
  const fullPath = path.join(TARGET_DIR, file.path);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(fullPath)) {
    let content = file.content;
    content = content.replace(/^\+/gm, '').replace(/^\+/, '');
    if (content.startsWith('\n')) content = content.slice(1);
    fs.writeFileSync(fullPath, content);
    created++;
  }
}

if (created > 0) {
  console.log(`[postinstall] Applied ${PKG} patch: created ${created} file(s)`);
} else {
  console.log(`[postinstall] ${PKG} patch already applied`);
}
