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

  // Start from the hunk offset (0-indexed from @@ line)
  let ci = hunkOffset || 0;

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

// Dynamically discover ALL installed locations of expo-modules-core using npm ls
function discoverInstalledLocations() {
  const locations = new Set(TARGET_DIRS.filter(fs.existsSync));
  
  try {
    // Run npm ls to find all resolution paths
    const { execSync } = require('child_process');
    const output = execSync('npm ls expo-modules-core --all --json 2>/dev/null || true', { encoding: 'utf-8', cwd: path.join(__dirname, '..') });
    const npmLs = JSON.parse(output);
    
    function walk(obj) {
      if (!obj || typeof obj !== 'object') return;
      if (obj.resolved && obj.version) {
        // Find the path from resolved or from node_modules structure
        const pkgPath = path.dirname(require.resolve('expo-modules-core/package.json', { paths: [path.join(__dirname, '..')] }));
        if (pkgPath && fs.existsSync(pkgPath)) locations.add(pkgPath);
      }
      if (obj.dependencies) Object.values(obj.dependencies).forEach(walk);
    }
    walk(npmLs);
  } catch (_) {}
  
  // Also check common hoisted locations
  const candidates = [
    path.join(__dirname, '..', 'node_modules', PKG),
    path.join(__dirname, '..', 'node_modules', 'expo', 'node_modules', PKG),
    // Yarn PnP or pnpm structures (if applicable)
    path.join(__dirname, '..', '.yarn', 'cache', PKG),
  ];
  
  candidates.forEach(c => { if (fs.existsSync(c)) locations.add(c); });
  
  return Array.from(locations);
}

const discoveredDirs = discoverInstalledLocations();

if (discoveredDirs.length === 0) {
  console.log(`[postinstall] No ${PKG} installations found in node_modules tree`);
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
