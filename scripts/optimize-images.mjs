import sharp from "sharp";
import fg from "fast-glob";
import fs from "fs-extra";

const INPUT_DIR = "public/img-src";
const OUTPUT_DIR = "public/img";

await fs.emptyDir(OUTPUT_DIR);

const files = await fg(`${INPUT_DIR}/**/*.{png,jpg,jpeg}`);

for (const file of files) {
  const name = file.split("/").pop().split(".")[0];
  const sizes = [400, 800, 1200];

  for (const size of sizes) {
    // WebP
    await sharp(file)
      .resize(size)
      .webp({ quality: 80 })
      .toFile(`${OUTPUT_DIR}/${name}-${size}.webp`);

    // AVIF
    await sharp(file)
      .resize(size)
      .avif({ quality: 60 })
      .toFile(`${OUTPUT_DIR}/${name}-${size}.avif`);
  }

  console.log(`✅ Optimized: ${file}`);
}

console.log("🚀 Images optimized and saved to /public/img/");
