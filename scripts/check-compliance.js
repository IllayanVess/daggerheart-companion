#!/usr/bin/env node

// SPDX-License-Identifier: Proprietary (code) + DPCGL (SRD content)
// This code is original work by the project author.
// Game rules referenced from the Daggerheart SRD are used under the
// Darrington Press Community Gaming License.
// Full license: https://darringtonpress.com/license/
// SRD reference: https://daggerheartsrd.com/

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const requiredAttribution =
  "This product includes materials from the Daggerheart System Reference Document 1.0";

// DPCGL compliance: scan the static locations used by this repo and common frontend stacks.
const scanRoots = [
  "assets",
  "public",
  "static",
  "src/assets",
  "frontend/assets",
  "frontend/public",
  "frontend/static",
  "frontend/src/assets",
];
const prohibitedExtensions = new Set([".png", ".jpg", ".jpeg", ".pdf", ".psd", ".ai", ".webp"]);
const filenameBlocklist = ["logo", "artwork", "official", "map", "darrington", "critical-role", "daggerheart-art"];

function walkFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const absolutePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return walkFiles(absolutePath);
    }
    return entry.isFile() ? [absolutePath] : [];
  });
}

const scannedFiles = scanRoots.flatMap((root) => walkFiles(path.join(repoRoot, root)));
const failures = [];

for (const filePath of scannedFiles) {
  const extension = path.extname(filePath).toLowerCase();
  const relativePath = path.relative(repoRoot, filePath).replaceAll(path.sep, "/");
  const filename = path.basename(filePath).toLowerCase();

  if (prohibitedExtensions.has(extension)) {
    failures.push(`${relativePath} violates prohibited extension rule (${extension})`);
  }

  const keyword = filenameBlocklist.find((blockedWord) => filename.includes(blockedWord));
  if (keyword) {
    failures.push(`${relativePath} violates filename blocklist rule (${keyword})`);
  }
}

const readmePath = path.join(repoRoot, "README.md");
const readme = fs.existsSync(readmePath) ? fs.readFileSync(readmePath, "utf8") : "";
if (!readme.includes(requiredAttribution)) {
  failures.push("README.md is missing the required DPCGL attribution string");
}

if (failures.length > 0) {
  console.error(`FAIL: checked ${scannedFiles.length} files and found ${failures.length} compliance issue(s).`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`PASS: checked ${scannedFiles.length} files and found no compliance issues.`);
