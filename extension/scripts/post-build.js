import { copyFileSync, mkdirSync, readdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = resolve(__dirname, "../dist");
const assets = resolve(dist, "assets");

// Copy manifest
copyFileSync(resolve(__dirname, "../manifest.json"), resolve(dist, "manifest.json"));

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

console.log("Post-build complete. dist/ is ready to load as an unpacked extension.");
