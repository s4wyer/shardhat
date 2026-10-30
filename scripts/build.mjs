import { copyFile, mkdir, rm } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const output = new URL("dist/", root);
// Explicitly list public assets so credentials, tools, and docs cannot be published.
const assets = [
  "index.html", "styles.css", "app.js", "url-parser.js", "sia-client.js",
  "download-sink.js", "sw-download.js", "_headers",
  "pkg/sia_storage_wasm.js", "pkg/sia_storage_wasm_bg.wasm",
];

await rm(output, { recursive: true, force: true });
await mkdir(new URL("pkg/", output), { recursive: true });
await Promise.all(assets.map((file) => copyFile(new URL(file, root), new URL(file, output))));
console.log(`Built ${assets.length} public assets in dist/.`);
