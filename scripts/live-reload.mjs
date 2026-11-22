import os from "node:os";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === "IPv4" && !net.internal && !net.address.startsWith("169.254")) {
        return net.address;
      }
    }
  }
  return "localhost";
}

async function main() {
  const ip = getLocalIp();
  const devUrl = `http://${ip}:5173`;

  console.log("\n==================================================");
  console.log("⚡ CAPACITOR LIVE RELOAD ACTIVATED");
  console.log(`📡 Local Network Dev Server: ${devUrl}`);
  console.log("==================================================\n");

  // Update android/app/src/main/assets/capacitor.config.json with live reload URL
  const androidAssetConfig = path.join(
    rootDir,
    "android",
    "app",
    "src",
    "main",
    "assets",
    "capacitor.config.json"
  );

  if (fs.existsSync(androidAssetConfig)) {
    try {
      const config = JSON.parse(fs.readFileSync(androidAssetConfig, "utf-8"));
      config.server = config.server || {};
      config.server.url = devUrl;
      config.server.cleartext = true;
      fs.writeFileSync(androidAssetConfig, JSON.stringify(config, null, 2), "utf-8");
      console.log(`✓ Configured Android app to stream live changes from ${devUrl}`);
    } catch (err) {
      console.warn("Could not patch android capacitor.config.json:", err.message);
    }
  }

  console.log("🚀 Starting Vite dev server with hot module reloading...");
  console.log("👉 Any edit saved in src/ will instantly update your Android device without reinstalling!\n");

  const vite = spawn("npx", ["vite", "--host"], {
    cwd: rootDir,
    stdio: "inherit",
    shell: true,
  });

  vite.on("close", (code) => {
    process.exit(code || 0);
  });
}

main().catch(console.error);
