import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const outDir = join(root, "out");
const dest = join(root, "public_html");
const zipName = "Fooody.in-website-for-PC.zip";
const zipPath = join(root, zipName);

if (!existsSync(outDir)) {
  console.error("Missing out/. Run npm run build first.");
  process.exit(1);
}

rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
cpSync(outDir, dest, {
  recursive: true,
  filter: (source) => {
    const base = source.split(/[/\\]/).pop() ?? "";
    if (base.startsWith("__next")) return false;
    if (base === "index.txt") return false;
    return true;
  },
});

const howTo = `FOOODY.IN — files for your PC
================================

This folder IS the website. You can:

A) View it on your computer
   Windows: double-click  start-on-windows.bat
   Mac:     double-click  start-on-mac-or-linux.command
   Then a browser window opens at http://localhost:8080

   Keep the black/terminal window open while you browse.
   Close that window when you are done.

B) Put it on Hostinger
   Upload EVERYTHING inside this folder into Hostinger's public_html
   (including .htaccess, index.html, images, and the _next folder).

Do not only double-click index.html — the design will look broken.
Use start-on-windows.bat (or the Mac file) instead.

Fooody.in  ·  Proudly born in Kerala
`;

writeFileSync(join(dest, "START-HERE.txt"), howTo);

writeFileSync(
  join(dest, "start-on-windows.bat"),
  `@echo off
cd /d "%~dp0"
echo.
echo  Fooody.in website
echo  Opening http://localhost:8080
echo  Keep this window open while you view the site.
echo  Close this window to stop.
echo.

start "" "http://localhost:8080/"

where py >nul 2>&1 && py -m http.server 8080 && goto :eof
where python >nul 2>&1 && python -m http.server 8080 && goto :eof
where python3 >nul 2>&1 && python3 -m http.server 8080 && goto :eof

echo Python was not found on this PC.
echo You can still upload this whole folder to Hostinger public_html.
pause
`,
);

writeFileSync(
  join(dest, "start-on-mac-or-linux.command"),
  `#!/bin/bash
cd "$(dirname "$0")"
echo
echo "Fooody.in website"
echo "Opening http://localhost:8080"
echo "Keep this window open while you view the site."
echo
(sleep 1; open "http://localhost:8080/" 2>/dev/null || xdg-open "http://localhost:8080/" 2>/dev/null) &
python3 -m http.server 8080
`,
);

spawnSync("chmod", ["+x", join(dest, "start-on-mac-or-linux.command")]);

const zip = spawnSync(
  "python3",
  [
    "-c",
    `
import os, zipfile
root = ${JSON.stringify(dest)}
zip_path = ${JSON.stringify(zipPath)}
with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
    for dirpath, _, files in os.walk(root):
        for name in files:
            full = os.path.join(dirpath, name)
            z.write(full, os.path.relpath(full, os.path.dirname(root)))
print("wrote", zip_path)
`,
  ],
  { encoding: "utf8" },
);

if (zip.status !== 0) {
  console.error(zip.stdout, zip.stderr);
  process.exit(zip.status ?? 1);
}

console.log(zip.stdout.trim());
console.log("Ready:", dest);
console.log("Zip:", zipPath);
