import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const dir = "dist/client";
const assets = readdirSync(join(dir, "assets"));
const css = assets.find((f) => f.startsWith("styles-") && f.endsWith(".css"));
if (!css) throw new Error("client CSS bundle not found");

let html = readFileSync(join(dir, "_shell.html"));
if (html[0] === 0xef && html[1] === 0xbb && html[2] === 0xbf) html = html.subarray(3);
html = Buffer.from(html.toString("utf8").replaceAll("\0", ""));
html = Buffer.from(
  html
    .toString("utf8")
    .replace(/\/Zoo-Wroclaw\/assets\/styles-[^"]+\.css/g, `/Zoo-Wroclaw/assets/${css}`),
);

writeFileSync(join(dir, "index.html"), html);
writeFileSync(join(dir, "404.html"), html);
writeFileSync(join(dir, ".nojekyll"), "");
console.log("packed GitHub Pages site → dist/client (index.html + 404.html)");
