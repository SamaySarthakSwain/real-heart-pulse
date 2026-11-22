import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const srcDir = path.join(rootDir, "src");
const androidDir = path.join(rootDir, "android");
const targetApk = path.resolve(rootDir, "..", "Ear_to_Heart_v1.0.apk");
const builtApk = path.join(
  androidDir,
  "app",
  "build",
  "outputs",
  "apk",
  "debug",
  "app-debug.apk"
);

console.log("\n========================================================");
console.log("👀 AUTO-WATCHER STARTED: AUTOMATIC APK SYNC & REBUILD");
console.log("Watching directory:", srcDir);
console.log("Target APK output:", targetApk);
console.log("========================================================\n");

let buildInProgress = false;
let pendingBuild = false;
let debounceTimer = null;

function runBuildCycle(changedFile) {
  if (buildInProgress) {
    pendingBuild = true;
    console.log(`[QUEUE] Build already in progress. Queued rebuild for: ${changedFile}`);
    return;
  }

  buildInProgress = true;
  const startTime = Date.now();

  console.log(`\n--------------------------------------------------------`);
  console.log(`[${new Date().toLocaleTimeString()}] 🔄 Change detected in: ${changedFile}`);
  console.log(`Step 1/4: Building Vite & Nitro distribution...`);

  try {
    // 1. Build Vite
    execSync("npm run build", { cwd: rootDir, stdio: "ignore" });

    // 2. Prepare Mobile Dist
    console.log(`Step 2/4: Preparing static mobile assets...`);
    execSync("node scripts/prepare-mobile-dist.mjs", { cwd: rootDir, stdio: "ignore" });

    // 3. Sync to Capacitor
    console.log(`Step 3/4: Syncing Capacitor Android assets...`);
    execSync("npx cap sync android", { cwd: rootDir, stdio: "ignore" });

    // 4. Assemble APK via Gradle
    console.log(`Step 4/4: Recompiling Android APK via Gradle...`);
    const gradlewCmd = process.platform === "win32" ? ".\\gradlew.bat assembleDebug" : "./gradlew assembleDebug";
    execSync(gradlewCmd, { cwd: androidDir, stdio: "ignore" });

    // Copy to root
    if (fs.existsSync(builtApk)) {
      fs.copyFileSync(builtApk, targetApk);
      const sizeMb = (fs.statSync(targetApk).size / (1024 * 1024)).toFixed(2);
      const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`\n✅ [SUCCESS] APK automatically updated in ${durationSec}s!`);
      console.log(`📦 Output: ${targetApk} (${sizeMb} MB)`);
      console.log(`Waiting for next changes...`);
    } else {
      console.warn("⚠️ Gradle finished but output APK not found at:", builtApk);
    }
  } catch (error) {
    console.error("❌ Auto-rebuild error:", error.message);
  } finally {
    buildInProgress = false;
    if (pendingBuild) {
      pendingBuild = false;
      runBuildCycle("queued changes");
    }
  }
}

// Watch src folder recursively
fs.watch(srcDir, { recursive: true }, (eventType, filename) => {
  if (!filename) return;
  // Ignore temp files or hidden files
  if (filename.includes(".tmp") || filename.includes("~") || filename.startsWith(".")) return;

  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    runBuildCycle(filename);
  }, 1200);
});

console.log("Watching for changes in real-time. Make edits and save your files!\n");
