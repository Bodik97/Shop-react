// scripts/optimize-images.mjs
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "fs-extra";
import fg from "fast-glob";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Налаштування
const SRC_DIR = path.resolve(__dirname, "../public/img-src");
const OUT_DIR = path.resolve(__dirname, "../public/img");
const exts = ["jpg", "jpeg", "png"];           // вхідні формати
const widths = [480, 768, 1024, 1600];         // цільові ширини
const makeFormats = ["webp", "avif", "jpeg"];  // вихідні формати

const quality = {
  webp: 78,
  avif: 50,
  jpeg: 82,
};

const concurrency = 4; // одночасна обробка файлів

async function ensureDirs() {
  await fs.ensureDir(SRC_DIR);
  await fs.ensureDir(OUT_DIR);
}

function outName(srcAbs, width, fmt) {
  const rel = path.relative(SRC_DIR, srcAbs);
  const dir = path.dirname(rel);
  const base = path.basename(rel, path.extname(rel));
  return path.join(OUT_DIR, dir, `${base}-w${width}.${fmt}`);
}

async function newerOrMissing(src, out) {
  try {
    const [s, o] = await Promise.all([fs.stat(src), fs.stat(out)]);
    return s.mtimeMs > o.mtimeMs; // true якщо джерело новіше => треба перегенерити
  } catch {
    return true; // вихідного немає => генеруємо
  }
}

async function processFile(src) {
  const input = sharp(src);
  const meta = await input.metadata();
  const maxSrcW = meta.width || 0;

  // не збільшуємо зображення
  const targetWidths = widths
    .filter((w) => w <= maxSrcW || maxSrcW === 0)
    .length
    ? widths.filter((w) => w <= maxSrcW || maxSrcW === 0)
    : [maxSrcW || widths[0]];

  for (const w of targetWidths) {
    for (const fmt of makeFormats) {
      const out = outName(src, w, fmt);
      await fs.ensureDir(path.dirname(out));
      const need = await newerOrMissing(src, out);
      if (!need) continue;

      let pipeline = sharp(src).resize({ width: w, fit: "inside", withoutEnlargement: true });
      if (fmt === "webp") pipeline = pipeline.webp({ quality: quality.webp });
      if (fmt === "avif") pipeline = pipeline.avif({ quality: quality.avif });
      if (fmt === "jpeg") pipeline = pipeline.jpeg({ quality: quality.jpeg, mozjpeg: true });

      await pipeline.toFile(out);
      console.log("✔", path.relative(OUT_DIR, out));
    }
  }
}

async function main() {
  await ensureDirs();

  const patterns = exts.map((e) => `**/*.${e}`);
  const files = await fg(patterns, { cwd: SRC_DIR, absolute: true, dot: false });

  if (!files.length) {
    console.log(`(Порожньо) Поклади вихідні зображення у ${path.relative(process.cwd(), SRC_DIR)}`);
    return;
  }

  console.log(`Знайдено ${files.length} файлів. Оптимізую…`);

  // Проста черга з обмеженням паралельності
  let i = 0;
  const pool = Array.from({ length: concurrency }, async function worker() {
    while (i < files.length) {
      const idx = i++;
      const f = files[idx];
      try {
        await processFile(f);
      } catch (err) {
        console.error("✖ Помилка для", f, err?.message || err);
      }
    }
  });

  await Promise.all(pool);
  console.log("Готово! Результат у:", path.relative(process.cwd(), OUT_DIR));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
