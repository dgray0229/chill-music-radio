/**
 * expo-modules-core patch script
 *
 * This script patched expo-modules-core's EXDefines.h with inline helper
 * functions that were removed from the precompiled XCFramework. As of the
 * expo-av patch (which now defines these helpers locally), this script is
 * kept for compatibility but no longer required.
 *
 * The expo-av patch at patches/expo-av+16.0.8.patch handles all the
 * necessary fixes for building expo-av against SDK 57's precompiled
 * ExpoModulesCore XCFramework.
 */

const fs = require("fs");
const path = require("path");

const PKG = "expo-modules-core";
const VERSION = "57.0.1";
const PATCH_FILE = path.join(
  __dirname,
  "..",
  ".patches",
  `${PKG}+${VERSION}.patch`,
);

if (!fs.existsSync(PATCH_FILE)) {
  console.log(
    `[postinstall] Skipping ${PKG} patch: no patch file at ${PATCH_FILE}`,
  );
  process.exit(0);
}

const TARGET_DIRS = [
  path.join(__dirname, "..", "node_modules", PKG),
  path.join(__dirname, "..", "node_modules", "expo", "node_modules", PKG),
];

// Find all installed locations
function discoverLocations() {
  const locations = new Set();
  TARGET_DIRS.forEach((d) => {
    if (fs.existsSync(d) && fs.existsSync(path.join(d, "package.json")))
      locations.add(d);
  });
  return Array.from(locations);
}

function applyPatch(filePath, patchContent) {
  const patchLines = patchContent.split("\n");
  let currentFile = null;
  let inHunk = false;
  let hunkLines = [];
  let modified = false;

  for (const line of patchLines) {
    if (line.startsWith("diff --git")) {
      // Apply previous hunk if any
      if (currentFile && inHunk && hunkLines.length > 0) {
        // Simple: just write lines that start with +
        const fullPath = path.join(filePath, currentFile);
        if (fs.existsSync(fullPath)) {
          let content = fs.readFileSync(fullPath, "utf-8");
          const addedLines = hunkLines
            .filter((l) => l.startsWith("+"))
            .map((l) => l.slice(1));
          const removedLines = hunkLines
            .filter((l) => l.startsWith("-"))
            .map((l) => l.slice(1));

          let changed = false;
          // Check if removals exist and additions are missing
          for (const removal of removedLines) {
            if (content.includes(removal)) {
              content = content.replace(removal, "");
              changed = true;
            }
          }
          for (const addition of addedLines) {
            if (!content.includes(addition)) {
              content = content.replace(
                removedLines[0] || "",
                addition + "\n" + (removedLines[0] || ""),
              );
              changed = true;
            }
          }

          if (changed) {
            fs.writeFileSync(fullPath, content);
            modified = true;
          }
        }
      }
      const match = line.match(/b\/(.+)$/);
      currentFile = match ? match[1] : null;
      inHunk = false;
      hunkLines = [];
    } else if (line.startsWith("@@ ")) {
      inHunk = true;
      hunkLines = [];
    } else if (inHunk) {
      hunkLines.push(line);
    }
  }

  return modified;
}

const locations = discoverLocations();
console.log(
  `[postinstall] Found ${PKG} at ${locations.length} location(s): ${locations.join(", ")}`,
);

for (const dir of locations) {
  const patchContent = fs.readFileSync(PATCH_FILE, "utf-8");
  const result = applyPatch(dir, patchContent);
  if (result) {
    console.log(`[postinstall] Applied ${PKG} patch at ${dir}`);
  } else {
    console.log(`[postinstall] ${PKG} patch already applied at ${dir}`);
  }
}

console.log(`[postinstall] ${PKG} patch check complete.`);
process.exit(0);
