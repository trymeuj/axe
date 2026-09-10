import { copyFileSync, mkdirSync, existsSync, readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = resolve(__dirname, "../dist");
const assets = resolve(dist, "assets");
const buildTarget = process.argv[2] ?? "local";

// Copy manifest
copyFileSync(resolve(__dirname, "../manifest.json"), resolve(dist, "manifest.json"));

if (buildTarget === "production") {
  const manifestPath = resolve(dist, "manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  manifest.host_permissions = manifest.host_permissions.filter(
    (permission) => !permission.startsWith("http://localhost:")
  );
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

// Copy icons
mkdirSync(resolve(dist, "icons"), { recursive: true });
for (const icon of ["icon16.png", "icon48.png", "icon128.png"]) {
  const src = resolve(__dirname, "../icons", icon);
  if (existsSync(src)) {
    copyFileSync(src, resolve(dist, "icons", icon));
  }
}

// Copy popup
mkdirSync(resolve(dist, "src/popup"), { recursive: true });
copyFileSync(
  resolve(__dirname, "../src/popup/index.html"),
  resolve(dist, "src/popup/index.html")
);

// Move sidebar html to assets for web_accessible_resources
const sidebarHtml = resolve(dist, "src/sidebar/index.html");
if (existsSync(sidebarHtml)) {
  copyFileSync(sidebarHtml, resolve(assets, "sidebar.html"));
}

// Copy content.css to assets
const contentCss = resolve(__dirname, "../src/content/content.css");
if (existsSync(contentCss)) {
  copyFileSync(contentCss, resolve(assets, "content.css"));
}

console.log(`Post-build complete (${buildTarget}). dist/ is ready to load or package.`);
