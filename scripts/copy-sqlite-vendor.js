/**
 * postinstall script: copy sqlite3 vendor sources into expo-sqlite/ios/
 *
 * expo-sqlite's podspec defines a `vendor_sqlite_src!` hook that copies
 * sqlite3.c and sqlite3.h from vendor/sqlite3/ into ios/ at pod-install
 * time.  When pods are cached or the hook is skipped (e.g. during
 * `npx expo run:ios` fast-paths), the files end up missing and the
 * build fails with "'sqlite3.h' file not found".
 *
 * This script ensures the files are always present in the pod directory,
 * regardless of whether CocoaPods ran the hook.
 */

const fs = require("fs");
const path = require("path");

const PKG_DIR = path.join(__dirname, "..", "node_modules", "expo-sqlite");
const VENDOR_DIR = path.join(PKG_DIR, "vendor", "sqlite3");
const IOS_DIR = path.join(PKG_DIR, "ios");
const FILES = ["sqlite3.c", "sqlite3.h"];

if (!fs.existsSync(PKG_DIR)) {
  console.log("[copy-sqlite-vendor] expo-sqlite not installed, skipping.");
  process.exit(0);
}

if (!fs.existsSync(VENDOR_DIR)) {
  console.log(
    "[copy-sqlite-vendor] vendor/sqlite3 not found at " + VENDOR_DIR + ", skipping."
  );
  process.exit(0);
}

let copied = 0;
for (const file of FILES) {
  const src = path.join(VENDOR_DIR, file);
  const dst = path.join(IOS_DIR, file);
  const srcExists = fs.existsSync(src);
  const dstExists = fs.existsSync(dst);

  if (!srcExists) {
    console.warn("[copy-sqlite-vendor] source missing: " + src);
    continue;
  }

  if (dstExists) {
    const srcStat = fs.statSync(src);
    const dstStat = fs.statSync(dst);
    if (srcStat.size === dstStat.size && srcStat.mtimeMs === dstStat.mtimeMs) {
      // Already up-to-date
      continue;
    }
  }

  fs.copyFileSync(src, dst);
  fs.utimesSync(dst, new Date(), new Date());
  copied++;
  console.log("[copy-sqlite-vendor] copied " + file + " -> ios/");
}

if (copied === 0) {
  console.log("[copy-sqlite-vendor] sqlite3 files already up-to-date.");
} else {
  console.log("[copy-sqlite-vendor] done (" + copied + " file(s) copied).");
}

process.exit(0);
