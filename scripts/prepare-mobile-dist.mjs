import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const staticDir = path.join(rootDir, ".vercel", "output", "static");
const distDir = path.join(rootDir, "dist");
const serverFuncPath = path.join(rootDir, ".vercel", "output", "functions", "__server.func", "index.mjs");

async function main() {
  console.log("Preparing mobile web assets for Capacitor...");

  if (!fs.existsSync(staticDir)) {
    throw new Error(`.vercel/output/static does not exist. Run 'npm run build' first.`);
  }

  // Ensure clean dist directory
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  fs.mkdirSync(distDir, { recursive: true });

  // Copy all static files into dist
  fs.cpSync(staticDir, distDir, { recursive: true });
  console.log("Copied static assets from .vercel/output/static to dist/");

  // Render index.html from server entry
  const serverModule = await import(pathToFileURL(serverFuncPath).href);
  const handler = serverModule.default;
  const res = await handler.fetch(new Request("http://localhost/"));
  if (res.status !== 200) {
    throw new Error(`Server returned HTTP ${res.status} when rendering /`);
  }
  const html = await res.text();
  const indexPath = path.join(distDir, "index.html");
  fs.writeFileSync(indexPath, html, "utf-8");
  console.log(`Generated dist/index.html (${html.length} bytes)`);

  console.log("Mobile distribution ready at:", distDir);
}

main().catch((err) => {
  console.error("Failed to prepare mobile distribution:", err);
  process.exit(1);
});
