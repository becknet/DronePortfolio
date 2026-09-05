import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const site = JSON.parse(await readFile(new URL("../content/site.json", import.meta.url), "utf8"));
const gallery = JSON.parse(await readFile(new URL("../content/gallery.json", import.meta.url), "utf8"));

test("uses the approved public URL", () => {
  assert.equal(site.siteUrl, "https://becknet.github.io/DronePortfolio/");
});

test("all images have unique, complete metadata", () => {
  assert.ok(gallery.length > 0);
  assert.equal(new Set(gallery.map(({ slug }) => slug)).size, gallery.length);
  for (const image of gallery) {
    assert.ok(image.title.length > 3);
    assert.ok(image.alt.length > 20);
    assert.ok(image.caption.length > 20);
    assert.ok(site.categoryOrder.includes(image.category));
  }
  for (const category of site.categoryOrder) {
    assert.ok(gallery.some((image) => image.category === category));
  }
});

test("analytics stays disabled without a measurement id", () => {
  assert.equal(site.analytics.enabled, false);
  assert.equal(site.analytics.measurementId, "");
});
