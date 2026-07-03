const fs = require('fs');
const path = require('path');

// Global error handler to ensure we always get a stack trace on EAS
process.on('uncaughtException', (err) => {
  console.error('[postinstall] UNCAUGHT EXCEPTION:', err && err.stack ? err.stack : err);
  process.exit(2);
});
process.on('unhandledRejection', (reason) => {
  console.error('[postinstall] UNHANDLED REJECTION:', reason);
  process.exit(3);
});

const PKG = 'expo-modules-core';
const VERSION = '57.0.1';
const PATCH_FILE = path.join(__dirname, '..', '.patches', `${PKG}+${VERSION}.patch`);
const TARGET_DIRS = [
  path.join(__dirname, '..', 'node_modules', PKG),
  path.join(__dirname, '..', 'node_modules', 'expo', 'node_modules', PKG),
];

console.log(`[postinstall] Starting ${PKG}@${VERSION} patch script (cwd=${process.cwd()}, __dirname=${__dirname})`);

if (!fs.existsSync(PATCH_FILE)) {
  console.log(`[postinstall] No patch found for ${PKG} at ${PATCH_FILE}`);
  process.exit(0);
}

const patchContent = fs.readFileSync(PATCH_FILE, 'utf-8');
console.log(`[postinstall] Loaded patch file (${patchContent.length} bytes, ${patchContent.split('\n').length} lines)`);

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
      if (currentHunk) {
        while (currentHunk.lines.length > 0 && currentHunk.lines[currentHunk.lines.length - 1] === '') {
          currentHunk.lines.pop();
        }
        currentHunks.push(currentHunk);
      }
      const offsetMatch = line.match(/@@ -(\d+)/);
      const offset = offsetMatch ? parseInt(offsetMatch[1], 10) : 0;
      currentHunk = { offset: Math.max(0, offset - 1), lines: [] };
    } else {
      if (currentHunk) {
        currentHunk.lines.push(line);
      }
    }
  }
  if (currentFile) {
    if (currentHunk) {
      while (currentHunk.lines.length > 0 && currentHunk.lines[currentHunk.lines.length - 1] === '') {
        currentHunk.lines.pop();
      }
      currentHunks.push(currentHunk);
    }
    if (currentHunks.length > 0) files.push({ path: currentFile, hunks: currentHunks });
  }
  return files;
}

function hunkAlreadyApplied(existingContent, hunkLines) {
  const addedLines = hunkLines.filter(l => l.startsWith('+')).map(l => l.slice(1)).filter(l => l.trim().length > 0);
  const removedLines = hunkLines.filter(l => l.startsWith('-')).map(l => l.slice(1)).filter(l => l.length > 0);
  if (addedLines.length === 0) return false;

  const existingLines = new Set(existingContent.split('\n'));

  const hasAdditions = addedLines.slice(0, 3).every(line => existingLines.has(line));
  if (!hasAdditions) return false;

  if (removedLines.length > 0) {
    return removedLines.every(line => !existingLines.has(line));
  }

  return true;
}

function applyHunk(existingContent, hunkLines, hunkOffset) {
  if (hunkAlreadyApplied(existingContent, hunkLines)) return { status: 'already_applied' };

  // A hunk has lines like:
  //  context     (space prefix) - unchanged line
  // -removed     - line to remove
  // +added       - line to add
  //
  // Walk through hunk and content lines in order, matching context
  // and applying removals/additions into the result.
  const contentLines = existingContent.split('\n');
  const result = [];

  // Find the starting position by searching for the first context line
  // (offsets in patch files may be stale if the file changed)
  let ci = hunkOffset || 0;
  const firstContextLine = hunkLines.find(l => l.startsWith(' '));
  if (firstContextLine) {
    const expected = firstContextLine.slice(1);
    // Search from offset backwards and forwards to find the context
    let found = false;
    for (let delta = 0; delta <= Math.max(50, contentLines.length); delta++) {
      for (const dir of delta === 0 ? [0] : [-1, 1]) {
        const tryIdx = ci + delta * dir;
        if (tryIdx >= 0 && tryIdx < contentLines.length && contentLines[tryIdx] === expected) {
          ci = tryIdx;
          found = true;
          break;
        }
      }
      if (found) break;
    }
    if (!found) return null; // context not found
  }

  // Copy all lines before the hunk unchanged
  for (let i = 0; i < ci; i++) {
    result.push(contentLines[i]);
  }

  for (const hunkLine of hunkLines) {
    if (hunkLine.startsWith(' ')) {
      // Context line: must match the next content line
      const expected = hunkLine.slice(1);
      if (ci >= contentLines.length || contentLines[ci] !== expected) {
        return null; // context doesn't match
      }
      result.push(contentLines[ci]);
      ci++;
    } else if (hunkLine.startsWith('-')) {
      // Removal: skip matching content line
      const expected = hunkLine.slice(1);
      if (ci >= contentLines.length || contentLines[ci] !== expected) {
        return null; // removal doesn't match
      }
      ci++; // skip this line (removed)
    } else if (hunkLine.startsWith('+')) {
      // Addition: emit the new line
      result.push(hunkLine.slice(1));
    } else {
      // Empty line or comment within hunk - should not occur in valid patches
    }
  }

  // Append any remaining content lines after the patched region
  while (ci < contentLines.length) {
    result.push(contentLines[ci]);
    ci++;
  }

  return { status: 'applied', content: result.join('\n') };
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
      let shift = 0; // cumulative line shift from applied hunks

      for (const hunk of file.hunks) {
        const adjustedOffset = Math.max(0, hunk.offset + shift);
        const result = applyHunk(modifiedContent, hunk.lines, adjustedOffset);
        if (result && result.status === 'applied') {
          const origLineCount = hunk.lines.filter(l => l.startsWith(' ') || l.startsWith('-')).length;
          const newLineCount = hunk.lines.filter(l => l.startsWith(' ') || l.startsWith('+')).length;
          shift += newLineCount - origLineCount;
          modifiedContent = result.content;
          changed = true;
        } else if (result && result.status === 'already_applied') {
          // Account for the line shift from already-applied hunks too
          const origLineCount = hunk.lines.filter(l => l.startsWith(' ') || l.startsWith('-')).length;
          const newLineCount = hunk.lines.filter(l => l.startsWith(' ') || l.startsWith('+')).length;
          shift += newLineCount - origLineCount;
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

// Recursively walk filesystem from root to find ALL expo-modules-core installations
function discoverInstalledLocations() {
  const locations = new Set();
  const root = path.join(__dirname, '..');
  
  // Helper: check if a directory looks like a valid expo-modules-core package
  function isValidExpoModulesCore(dir) {
    try {
      const pkgJson = path.join(dir, 'package.json');
      if (!fs.existsSync(pkgJson)) return false;
      const content = fs.readFileSync(pkgJson, 'utf-8');
      return content.includes(PKG);
    } catch (_) { return false; }
  }
  
  // Helper: recursively search (with depth limit)
  function search(dir, depth) {
    if (depth > 8) return;
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return; }
    
    for (const entry of entries) {
      // Always descend into node_modules, but skip other hidden dirs
      if (entry.name.startsWith('.') && entry.name !== 'node_modules') continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === PKG && isValidExpoModulesCore(fullPath)) {
          locations.add(fullPath);
        }
        search(fullPath, depth + 1);
      }
    }
  }
  
  // Start from TARGET_DIRS (fast path for known locations)
  TARGET_DIRS.forEach(d => { if (fs.existsSync(d) && isValidExpoModulesCore(d)) locations.add(d); });
  
  // Full recursive search from project root (catches all hoisting layouts)
  search(root, 0);
  
  return Array.from(locations);
}

let discoveredDirs = discoverInstalledLocations();

if (discoveredDirs.length === 0) {
  console.log(`[postinstall] Discovery found 0 ${PKG} locations, falling back to TARGET_DIRS check...`);
  // Fallback: try TARGET_DIRS even if discovery missed them (timing/race condition)
  discoveredDirs = TARGET_DIRS.filter(p => fs.existsSync(p));
}

if (discoveredDirs.length === 0) {
  console.log(`[postinstall] No ${PKG} installations found (TARGET_DIRS: ${TARGET_DIRS.join(', ')})`);
  console.log(`[postinstall] This is expected if expo is not installed or uses a different package manager layout.`);
  process.exit(0);
}

console.log(`[postinstall] Found ${PKG} at: ${discoveredDirs.join(', ')}`);

let anyPatched = false;
for (const dir of discoveredDirs) {
  // applyPatchToDir may modify files, track if any succeeded
  const beforeModified = fs.existsSync(path.join(dir, 'ios', 'Core', 'Events', 'EventEmitter.swift')) 
    ? fs.readFileSync(path.join(dir, 'ios', 'Core', 'Events', 'EventEmitter.swift'), 'utf-8')
    : '';
  
  applyPatchToDir(dir);
  
  const afterModified = fs.existsSync(path.join(dir, 'ios', 'Core', 'Events', 'EventEmitter.swift'))
    ? fs.readFileSync(path.join(dir, 'ios', 'Core', 'Events', 'EventEmitter.swift'), 'utf-8')
    : '';
  
  if (beforeModified !== afterModified || afterModified.includes('nonisolated(unsafe) weak var')) {
    anyPatched = true;
  }
}

// VALIDATION: Verify Swift 6 fixes are present (no weak let on emitter)
let validationFailed = false;
for (const dir of discoveredDirs) {
  const emitterPath = path.join(dir, 'ios', 'Core', 'Events', 'EventEmitter.swift');
  if (fs.existsSync(emitterPath)) {
    const content = fs.readFileSync(emitterPath, 'utf-8');
    // Check for the exact pattern that causes Swift 6 error: nonisolated(unsafe) weak let emitter
    if (/nonisolated\(unsafe\)\s+weak\s+let\s+emitter/.test(content)) {
      console.error(`[postinstall] ❌ VALIDATION FAILED: ${emitterPath} still contains 'weak let emitter'`);
      validationFailed = true;
    } else if (content.includes('runtime.schedule { [weak self]')) {
      console.log(`[postinstall] ✓ Validated Swift 6 fix applied at ${emitterPath}`);
    }
  }
}

if (validationFailed) {
  console.error(`[postinstall] ❌ expo-modules-core Swift 6 patches NOT applied correctly. Build will fail on Xcode 26+ (Swift 6).`);
  console.error(`[postinstall]    Fix: Run with --clear-cache on EAS, or delete node_modules and npm install locally.`);
  process.exit(1);
}

if (!anyPatched && discoveredDirs.length > 0) {
  console.log(`[postinstall] ${PKG} patches already applied at all discovered locations (validated OK)`);
}
