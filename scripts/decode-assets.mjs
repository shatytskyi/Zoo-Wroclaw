import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

function loadB64(relOut) {
  const candidates = [relOut + ".b64", join("gh-assets", relOut + ".b64")];
  for (const path of candidates) {
    if (existsSync(path)) return readFileSync(path, "utf8");
    const chunks = [];
    for (let i = 0; existsSync(`${path}.${i}`); i++) {
      chunks.push(readFileSync(`${path}.${i}`, "utf8"));
    }
    if (chunks.length) return chunks.join("");
  }
  return "";
}

const files = ["public/zoo-plan.jpg", "public/og.jpg", "public/__grok/icon-180.png"];

for (const out of files) {
  if (existsSync(out)) continue;
  const raw = loadB64(out);
  if (!raw) continue;
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, Buffer.from(raw.replace(/\s+/g, ""), "base64"));
  console.log("decoded", out);
}
