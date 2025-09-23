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

async function generateBarrel(
  entrypoints,
  outputFile
) {
  let imports = [];

  for (const entry of entrypoints) {
    const stat = await fs.stat(entry);

    if (stat.isDirectory()) {
      // collect all .ts files from folder
      const files = await collectFiles(entry);
      for (const file of files) {
        const relativePath =
          "./" + path.relative(path.dirname(outputFile), file).replace(/\\/g, "/");
        imports.push(`import "${relativePath}";`);
      }
    } else if (entry.endsWith(".ts")) {
      // single file entrypoint
      const relativePath =
        "./" + path.relative(path.dirname(outputFile), entry).replace(/\\/g, "/");
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

  const barrelPath = `${distFolder}/build-barrel.ts`;

  await generateBarrel(
    [
      `${srcFolder}/app/app.ts`,
      `${srcFolder}/components`,
      `${srcFolder}/pages`
    ],
    barrelPath,
  );

  try {
    await build({
      entryPoints: [
        barrelPath,
      ],
      bundle: true,
      //outfile: "../dist/bundle.js",
      outfile: `${distFolder}/bundle.js`,
      //outdir: distFolder,
      format: "esm",
      sourcemap: true,
      minify: true,
      //entryNames: "[name]",
    })

    await fs.unlink(barrelPath);

    await fs.cp(`${srcFolder}/app/static`, `${distFolder}`, {recursive: true})
  } catch (err) {
    console.log(err);
  }
}

run();

