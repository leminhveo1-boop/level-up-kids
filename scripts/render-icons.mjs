#!/usr/bin/env node
/**
 * Render branded PWA icons from assets/icon.svg via sharp.
 * Usage: node scripts/render-icons.mjs
 */
import sharp from "sharp";
import { readFileSync, mkdirSync } from "node:fs";

const svg = readFileSync("assets/icon.svg");
mkdirSync("public/icons", { recursive: true });

// Standard icons — SVG already has its own rounded background
await sharp(svg).resize(192, 192).png().toFile("public/icons/icon-192.png");
await sharp(svg).resize(512, 512).png().toFile("public/icons/icon-512.png");
await sharp(svg).resize(180, 180).png().toFile("public/icons/apple-touch-icon.png");

// Maskable: full-bleed background (safe zone ≈ 80%) — scale art down on solid bg
const art = await sharp(svg).resize(410, 410).png().toBuffer();
await sharp({
  create: { width: 512, height: 512, channels: 4, background: "#2E7D32" },
})
  .composite([{ input: art, gravity: "centre" }])
  .png()
  .toFile("public/icons/icon-512-maskable.png");

console.log("Rendered branded icons: 192, 512, 512-maskable, apple-touch-icon");
