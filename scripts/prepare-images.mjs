import { access, mkdir, readFile, rm } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourceRoot = path.join(root, "source-images");
const outputRoot = path.join(root, "assets", "gallery");
const gallery = JSON.parse(await readFile(path.join(root, "content", "gallery.json"), "utf8"));
const widths = [480, 900, 1600, 2400];

await access(sourceRoot).catch(() => {
  throw new Error("source-images fehlt. Die privaten Originale werden nur lokal verarbeitet.");
});

await rm(outputRoot, { recursive: true, force: true });

for (const image of gallery) {
  const input = path.join(sourceRoot, image.source);
  const categorySlug = image.category.toLowerCase();
  const destination = path.join(outputRoot, categorySlug);
  await access(input).catch(() => {
    throw new Error(`Original fehlt: ${image.source}`);
  });
  await mkdir(destination, { recursive: true });

  for (const width of widths) {
    const pipeline = sharp(input, { failOn: "error" })
      .rotate()
      .resize({ width, withoutEnlargement: true, fit: "inside" });

    await pipeline
      .clone()
      .jpeg({ quality: width >= 1600 ? 86 : 80, mozjpeg: true })
      .toFile(path.join(destination, `${image.slug}-${width}.jpg`));

    await pipeline
      .clone()
      .webp({ quality: width >= 1600 ? 84 : 78, effort: 5 })
      .toFile(path.join(destination, `${image.slug}-${width}.webp`));
  }
}

console.log(`${gallery.length} Bilder in responsive, metadatenfreie Webvarianten umgewandelt.`);
