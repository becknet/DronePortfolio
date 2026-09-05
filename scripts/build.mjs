import { access, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const dist = path.join(root, "dist");
const site = JSON.parse(await readFile(path.join(root, "content", "site.json"), "utf8"));
const gallery = JSON.parse(await readFile(path.join(root, "content", "gallery.json"), "utf8"));

validateContent(site, gallery);
await validateImages(gallery);

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(path.join(root, "src", "assets"), path.join(dist, "assets"), { recursive: true });
await cp(path.join(root, "assets", "gallery"), path.join(dist, "assets", "gallery"), { recursive: true });

const template = await readFile(path.join(root, "src", "index.template.html"), "utf8");
const index = template
  .replace("<!-- CATEGORY_FILTERS -->", renderFilters(site.categoryOrder))
  .replace("<!-- GALLERY_ITEMS -->", renderGallery(gallery))
  .replace("<!-- IMAGE_JSON_LD -->", JSON.stringify(renderImageSchema(site.siteUrl, gallery)))
  .replaceAll("{{SITE_URL}}", site.siteUrl);

await writeFile(path.join(dist, "index.html"), index);

for (const file of ["datenschutz.html", "robots.txt", "sitemap.xml", "llms.txt", "site.webmanifest", ".nojekyll"]) {
  await cp(path.join(root, "src", file), path.join(dist, file));
}

console.log(`Build abgeschlossen: ${gallery.length} Bilder, ${site.categoryOrder.length} Kategorien.`);

function validateContent(siteConfig, images) {
  if (siteConfig.siteUrl !== "https://becknet.github.io/DronePortfolio/") {
    throw new Error("Die Canonical-URL muss der freigegebenen GitHub-Pages-Adresse entsprechen.");
  }
  const slugs = new Set();
  for (const image of images) {
    for (const field of ["source", "slug", "title", "alt", "caption", "category"]) {
      if (!image[field]?.trim()) throw new Error(`${field} fehlt bei ${image.slug || image.source || "einem Bild"}.`);
    }
    if (slugs.has(image.slug)) throw new Error(`Doppelter Bild-Slug: ${image.slug}`);
    if (!siteConfig.categoryOrder.includes(image.category)) throw new Error(`Unbekannte Kategorie: ${image.category}`);
    slugs.add(image.slug);
  }
  if (!slugs.has(siteConfig.heroSlug)) throw new Error("Das Hero-Bild fehlt in gallery.json.");
}

async function validateImages(images) {
  for (const image of images) {
    const folder = image.category.toLowerCase();
    for (const width of [480, 900, 1600, 2400]) {
      for (const format of ["jpg", "webp"]) {
        const file = path.join(root, "assets", "gallery", folder, `${image.slug}-${width}.${format}`);
        await access(file).catch(() => { throw new Error(`Webbild fehlt: ${path.relative(root, file)}`); });
        const metadata = await sharp(file).metadata();
        if (metadata.exif || metadata.xmp || metadata.iptc) throw new Error(`Metadaten nicht entfernt: ${file}`);
      }
    }
  }
}

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function assetBase(image) {
  return `assets/gallery/${image.category.toLowerCase()}/${image.slug}`;
}

function renderFilters(categories) {
  return ["Alle", ...categories].map((category, index) => `
    <button class="filter-button${index === 0 ? " is-active" : ""}" type="button" data-filter="${esc(category)}" aria-pressed="${index === 0}">${esc(category)}</button>`).join("");
}

function renderGallery(images) {
  return images.map((image, index) => {
    const base = assetBase(image);
    const portrait = ["gelbe-ordnung", "maschinen-und-schatten"].includes(image.slug);
    const displayHeight = portrait ? 1600 : 506;
    return `
      <figure class="gallery-item" data-category="${esc(image.category)}" data-index="${index}">
        <button class="gallery-trigger" type="button" aria-label="Bild „${esc(image.title)}“ gross anzeigen" data-index="${index}" data-title="${esc(image.title)}" data-caption="${esc(image.caption)}" data-category-label="${esc(image.category)}" data-alt="${esc(image.alt)}" data-jpg="${base}" data-webp="${base}">
          <picture>
            <source type="image/webp" srcset="${base}-480.webp 480w, ${base}-900.webp 900w" sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw">
            <img src="${base}-480.jpg" srcset="${base}-480.jpg 480w, ${base}-900.jpg 900w" sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw" width="900" height="${displayHeight}" alt="${esc(image.alt)}" loading="lazy" decoding="async">
          </picture>
          <span class="gallery-overlay" aria-hidden="true"><span>Gross ansehen</span></span>
        </button>
        <figcaption><span>${esc(image.title)}</span><small>${esc(image.category)}</small></figcaption>
      </figure>`;
  }).join("");
}

function renderImageSchema(siteUrl, images) {
  return images.map((image) => ({
    "@type": "ImageObject",
    name: image.title,
    description: image.caption,
    contentUrl: new URL(`${assetBase(image)}-2400.jpg`, siteUrl).href,
    thumbnailUrl: new URL(`${assetBase(image)}-900.jpg`, siteUrl).href,
    creator: { "@type": "Person", name: "Daniel Brodbeck" },
    copyrightNotice: "© Daniel Brodbeck"
  }));
}
