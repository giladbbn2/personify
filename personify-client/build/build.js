import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { build } from "esbuild";

const srcFolder = 'src';
const distFolder = 'dist';

async function collectFiles(dir, ext = ".ts") {
  let results = [];
  const entries = await fs.readdir(dir);

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const fileStat = await fs.stat(fullPath);

    if (fileStat.isDirectory()) {
      const subFiles = await collectFiles(fullPath, ext);
      results = results.concat(subFiles);
    } else if (entry.endsWith(ext)) {
      results.push(fullPath);
    }
  }

  return results;
}

async function generateBarrel(dirs, outputFile) {
  let imports = [];

  for (const dir of dirs) {
    const files = await collectFiles(dir);
    for (const file of files) {
      const relativePath =
        "./" + path.relative(path.dirname(outputFile), file).replace(/\\/g, "/");
      imports.push(`import "${relativePath}";`);
    }
  }

  const content = imports.join("\n") + "\n";
  await fs.writeFile(outputFile, content, "utf8");
  console.log(`✅ Barrel file generated: ${outputFile}`);
}

async function run() {
  fsSync.rmSync(distFolder, { recursive: true, force: true });

  if (!fsSync.existsSync(distFolder)){
      fsSync.mkdirSync(distFolder, { recursive: true });
  }

  const componentsBarrelPath = `${distFolder}/components.ts`;

  await generateBarrel(
    [`${srcFolder}/components`],
    componentsBarrelPath,
  );

  const pagesBarrelPath = `${distFolder}/pages.ts`;

  await generateBarrel(
    [`${srcFolder}/pages`],
    pagesBarrelPath,
  );

  try {
    await build({
      entryPoints: [
        `${srcFolder}/app/app.ts`,
        componentsBarrelPath,
        pagesBarrelPath,
      ],
      bundle: true,
      //outfile: "../dist/bundle.js",
      outdir: distFolder,
      format: "esm",
      sourcemap: true,
      minify: true,
      entryNames: "[name]",
    })
  } catch (err) {
    console.log(err);
  }

  await fs.copyFile(`${srcFolder}/app/index.html`, `${distFolder}/index.html`)

  await fs.unlink(componentsBarrelPath);
  await fs.unlink(pagesBarrelPath);
}

run();

