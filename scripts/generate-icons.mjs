#!/usr/bin/env node
/**
 * Generate placeholder PWA icons (pure Node, no deps).
 * Forest-green rounded square + amber "shield dot" — replace with branded art later.
 * Usage: node scripts/generate-icons.mjs
 */
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";

const FOREST = [46, 125, 50, 255]; // #2E7D32
const AMBER = [217, 151, 6, 255]; // #D97706
const LIGHT = [253, 251, 247, 255]; // #FDFBF7

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256).map((_, n) => {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      return c;
    });
  }
  let crc = -1;
  for (const b of buf) crc = (crc >>> 8) ^ table[(crc ^ b) & 0xff];
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}

function makePng(size, draw) {
  // RGBA raw with filter byte per row
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 4 + 1);
    raw[rowStart] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = draw(x, y, size);
      const i = rowStart + 1 + x * 4;
      raw[i] = r;
      raw[i + 1] = g;
      raw[i + 2] = b;
      raw[i + 3] = a;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

/** Rounded-square forest icon with amber core + light ring. */
function drawIcon(maskable) {
  return (x, y, size) => {
    const c = size / 2;
    const dx = x - c;
    const dy = y - c;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // maskable: full bleed background; regular: rounded square with transparency
    if (!maskable) {
      const radius = size * 0.22;
      const half = size / 2 - 1;
      const qx = Math.max(Math.abs(dx) - (half - radius), 0);
      const qy = Math.max(Math.abs(dy) - (half - radius), 0);
      if (Math.sqrt(qx * qx + qy * qy) > radius) return [0, 0, 0, 0];
    }

    // light ring
    if (dist < size * 0.34 && dist > size * 0.28) return LIGHT;
    // amber core
    if (dist <= size * 0.28) return AMBER;
    return FOREST;
  };
}

mkdirSync("public/icons", { recursive: true });
writeFileSync("public/icons/icon-192.png", makePng(192, drawIcon(false)));
writeFileSync("public/icons/icon-512.png", makePng(512, drawIcon(false)));
writeFileSync("public/icons/icon-512-maskable.png", makePng(512, drawIcon(true)));
console.log("Icons generated in public/icons/");
