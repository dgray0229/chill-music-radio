const fs = require('fs');
const path = require('path');

const PKG = 'expo-modules-core';
const VERSION = '57.0.1';
const PATCH_FILE = path.join(__dirname, '..', '.patches', `${PKG}+${VERSION}.patch`);
const TARGET_DIRS = [
  path.join(__dirname, '..', 'node_modules', PKG),
  path.join(__dirname, '..', 'node_modules', 'expo', 'node_modules', PKG),
];

if (!fs.existsSync(PATCH_FILE)) {
  console.log(`[postinstall] No patch found for ${PKG}`);
  process.exit(0);
}

const patchContent = fs.readFileSync(PATCH_FILE, 'utf-8');

function parsePatch(patchContent) {
  const files = [];
  let currentFile = null;
  let currentHunks = [];
  let currentHunk = null;

  for (const line of patchContent.split('\n')) {
    if (line.startsWith('diff --git')) {
      if (currentFile) {
        if (currentHunk) currentHunks.push(currentHunk);
        files.push({ path: currentFile, hunks: currentHunks });
      }
      const match = line.match(/b\/(.+)$/);
      currentFile = match ? match[1] : null;
      currentHunks = [];
      currentHunk = null;
    } else if (line.startsWith('new file mode')) {
      // new file flag
    } else if (line.startsWith('index ')) {
      // index line
    } else if (line.startsWith('--- ')) {
      // skip both --- a/path and --- /dev/null
    } else if (line.startsWith('+++ ')) {
      // skip +++ b/path
    } else if (line.startsWith('@@ ')) {
      if (currentHunk) currentHunks.push(currentHunk);
      currentHunk = { lines: [] };
    } else {
      if (currentHunk) {
        currentHunk.lines.push(line);
      }
    }
  }
  if (currentFile) {
    if (currentHunk) currentHunks.push(currentHunk);
    if (currentHunks.length > 0) files.push({ path: currentFile, hunks: currentHunks });
  }
  return files;
}

function hunkAlreadyApplied(existingContent, hunkLines) {
  const addedLines = hunkLines.filter(l => l.startsWith('+')).map(l => l.slice(1));
  if (addedLines.length === 0) return false;
  const sampleLines = addedLines.filter(l => l.trim().length > 0).slice(0, 3);
  return sampleLines.every(line => existingContent.includes(line));
}

function applyHunk(existingContent, hunkLines) {
  if (hunkAlreadyApplied(existingContent, hunkLines)) return { status: 'already_applied' };

  // Find context lines to determine insertion point
  // A hunk has lines like:
  //  context     (no prefix) - unchanged line
  // -removed     - line to remove  
  // +added       - line to add
  // First pass: collect context and changes
  const contextBefore = [];
  const changes = [];
  const contextAfter = [];
  let phase = 'before';

  for (const line of hunkLines) {
    if (line.startsWith('+')) {
      changes.push({ type: 'add', text: line.slice(1) });
      phase = 'change';
    } else if (line.startsWith('-')) {
      changes.push({ type: 'remove', text: line.slice(1) });
      phase = 'change';
    } else {
      // Context lines in unified diff have a leading space; strip it
      const text = line.startsWith(' ') ? line.slice(1) : line;
      if (phase === 'before') {
        contextBefore.push(text);
      } else {
        contextAfter.push(text);
      }
      phase = 'after';
    }
  }

  // Check if this is a pure addition (no removals)
  const hasRemovals = changes.some(c => c.type === 'remove');
  const hasAdditions = changes.some(c => c.type === 'add');

  if (!hasRemovals && hasAdditions) {
    // Pure addition: find the position after the last context-before line
    // and insert the new lines there
    const searchStr = contextBefore.join('\n');
    const idx = existingContent.indexOf(searchStr);
    if (idx === -1) return null;
    
    const pos = idx + searchStr.length;
    const addedLines = changes.filter(c => c.type === 'add').map(c => c.text);
    const before = existingContent.slice(0, pos);
    const after = existingContent.slice(pos);
    return { status: 'applied', content: before + '\n' + addedLines.join('\n') + after };
  }

  // Has removals: more complex, try to match context
  // Simple approach: try to find and replace the entire matched region
  if (contextBefore.length === 0 && contextAfter.length === 0) return null;
  const fullSearch = [...contextBefore, ...changes.map(c => c.type === 'remove' ? c.text : null).filter(Boolean), ...contextAfter].join('\n');
  const fullReplace = [...contextBefore, ...changes.filter(c => c.type === 'add').map(c => c.text), ...contextAfter].join('\n');
  
  const idx = existingContent.indexOf(fullSearch);
  if (idx === -1) return null;
  
  return { status: 'applied', content: existingContent.slice(0, idx) + fullReplace + existingContent.slice(idx + fullSearch.length) };
}

function applyPatchToDir(targetDir) {
  console.log(`[postinstall] Patching ${PKG} at ${targetDir}`);
  const files = parsePatch(patchContent);
  let created = 0;
  let modified = 0;

  for (const file of files) {
    const fullPath = path.join(targetDir, file.path);
    const dir = path.dirname(fullPath);

    const allLines = file.hunks.flatMap(h => h.lines);
    const hasRemovals = allLines.some(l => l.startsWith('-'));
    const hasAdditions = allLines.some(l => l.startsWith('+'));
    const isNewFile = !hasRemovals && file.hunks.length > 0 && 
      file.hunks[0].lines.every(l => l.startsWith('+'));

    if (isNewFile) {
      // New file: extract added lines, strip + prefix
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      if (!fs.existsSync(fullPath)) {
        let content = allLines.map(l => l.slice(1)).join('\n');
        if (content.startsWith('\n')) content = content.slice(1);
        fs.writeFileSync(fullPath, content);
        created++;
      }
    } else if (hasAdditions || hasRemovals) {
      // Modified file: apply diff to existing content
      if (!fs.existsSync(fullPath)) {
        console.log(`[postinstall] WARN: ${file.path} does not exist, cannot patch`);
        continue;
      }
      const existingContent = fs.readFileSync(fullPath, 'utf-8');
      let modifiedContent = existingContent;
      let changed = false;

      for (const hunk of file.hunks) {
        const result = applyHunk(modifiedContent, hunk.lines);
        if (result && result.status === 'applied') {
          modifiedContent = result.content;
          changed = true;
        } else if (result && result.status === 'already_applied') {
          // skip silently
        } else {
          console.log(`[postinstall] WARN: Could not apply hunk for ${file.path}`);
        }
      }

      if (changed) {
        fs.writeFileSync(fullPath, modifiedContent);
        modified++;
      }
    }
  }

  if (created > 0) {
    console.log(`[postinstall] Applied ${PKG} patch at ${targetDir}: created ${created} file(s)`);
  }
  if (modified > 0) {
    console.log(`[postinstall] Applied ${PKG} patch at ${targetDir}: modified ${modified} file(s)`);
  }
  if (created === 0 && modified === 0) {
    console.log(`[postinstall] ${PKG} patch already applied at ${targetDir}`);
  }
}

const existingDirs = TARGET_DIRS.filter(fs.existsSync);

if (existingDirs.length === 0) {
  const dirs = TARGET_DIRS.join(', ');
  console.log(`[postinstall] Target directory not found (tried: ${dirs})`);
  process.exit(0);
}

for (const dir of existingDirs) {
  applyPatchToDir(dir);
}
