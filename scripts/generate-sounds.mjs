#!/usr/bin/env node
/**
 * Generate chiptune-style game SFX as WAV files (pure Node, no deps, CC0 —
 * synthesized from scratch so there are zero licensing concerns).
 * Usage: node scripts/generate-sounds.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";

const SAMPLE_RATE = 44100;

/** Build a 16-bit mono WAV from float samples (-1..1). */
function toWav(samples) {
  const dataSize = samples.length * 2;
  const buf = Buffer.alloc(44 + dataSize);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(1, 22); // mono
  buf.writeUInt32LE(SAMPLE_RATE, 24);
  buf.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(dataSize, 40);
  samples.forEach((s, i) => {
    buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(s * 32767))), 44 + i * 2);
  });
  return buf;
}

const seconds = (s) => Math.floor(s * SAMPLE_RATE);
const mix = (...tracks) => {
  const len = Math.max(...tracks.map((t) => t.length));
  const out = new Float32Array(len);
  for (const t of tracks) for (let i = 0; i < t.length; i++) out[i] += t[i];
  // soft clip
  return Array.from(out, (v) => Math.tanh(v));
};

/**
 * Tone generator with ADSR-ish pluck envelope and optional pitch glide.
 * wave: sine | triangle | square
 */
function tone({ freq, freqEnd, dur, delay = 0, vol = 0.5, wave = "sine", decay = 4 }) {
  const total = seconds(delay + dur);
  const out = new Float32Array(total);
  const start = seconds(delay);
  const n = seconds(dur);
  const fEnd = freqEnd || freq;
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const f = freq + (fEnd - freq) * t;
    phase += (2 * Math.PI * f) / SAMPLE_RATE;
    let v = Math.sin(phase);
    if (wave === "triangle") v = (2 / Math.PI) * Math.asin(v);
    else if (wave === "square") v = Math.sign(v) * 0.6;
    // pluck envelope: fast attack, exponential decay
    const attack = Math.min(1, i / (SAMPLE_RATE * 0.005));
    const env = attack * Math.exp(-decay * t);
    out[start + i] = v * env * vol;
  }
  return out;
}

/** White-noise burst (for pickaxe/rock impacts). */
function noise({ dur, delay = 0, vol = 0.3, decay = 10, lowpass = 0.3 }) {
  const total = seconds(delay + dur);
  const out = new Float32Array(total);
  const start = seconds(delay);
  const n = seconds(dur);
  let prev = 0;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const white = Math.random() * 2 - 1;
    prev = prev + lowpass * (white - prev); // 1-pole lowpass for "thud"
    out[start + i] = prev * Math.exp(-decay * t) * vol;
  }
  return out;
}

// Note frequencies
const N = { C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, B5: 987.77, C6: 1046.5, E6: 1318.5, G6: 1568, A3: 220, A2: 110, C4: 261.63, G4: 392 };

const sounds = {
  // ✅ task complete — bright two-note chirp
  "complete": mix(
    tone({ freq: N.C5, freqEnd: N.E5, dur: 0.09, vol: 0.4, wave: "triangle" }),
    tone({ freq: N.G5, dur: 0.14, delay: 0.07, vol: 0.35, wave: "sine", decay: 6 })
  ),

  // ↩️ uncomplete — sad slide down
  "uncomplete": mix(
    tone({ freq: N.A3, freqEnd: N.A2, dur: 0.22, vol: 0.35, wave: "triangle", decay: 5 })
  ),

  // 🎉 level up — rising fanfare arpeggio with shimmer
  "levelup": mix(
    tone({ freq: N.C5, dur: 0.16, delay: 0.0, vol: 0.35, wave: "triangle", decay: 3 }),
    tone({ freq: N.E5, dur: 0.16, delay: 0.1, vol: 0.35, wave: "triangle", decay: 3 }),
    tone({ freq: N.G5, dur: 0.2, delay: 0.2, vol: 0.35, wave: "triangle", decay: 3 }),
    tone({ freq: N.C6, dur: 0.45, delay: 0.3, vol: 0.4, wave: "sine", decay: 2.5 }),
    tone({ freq: N.E6, dur: 0.4, delay: 0.38, vol: 0.18, wave: "sine", decay: 3 }),
    tone({ freq: N.G6, dur: 0.35, delay: 0.46, vol: 0.12, wave: "sine", decay: 3.5 })
  ),

  // ⛏️ mining hit — rock thud + tiny sparkle
  "mine": mix(
    noise({ dur: 0.1, vol: 0.5, decay: 14, lowpass: 0.25 }),
    tone({ freq: 180, freqEnd: 90, dur: 0.08, vol: 0.4, wave: "sine", decay: 10 }),
    tone({ freq: N.B5, dur: 0.05, delay: 0.02, vol: 0.1, wave: "sine", decay: 12 })
  ),

  // 🪙 coin / critical — classic bright ding-ding
  "coin": mix(
    tone({ freq: N.B5, dur: 0.07, vol: 0.35, wave: "square", decay: 5 }),
    tone({ freq: N.E6, dur: 0.28, delay: 0.07, vol: 0.4, wave: "sine", decay: 4 })
  ),

  // 🥚 hatch — pop + curious rising chirp
  "hatch": mix(
    noise({ dur: 0.05, vol: 0.4, decay: 20, lowpass: 0.6 }),
    tone({ freq: N.C5, freqEnd: N.A5, dur: 0.18, delay: 0.06, vol: 0.35, wave: "triangle", decay: 4 }),
    tone({ freq: N.E5, freqEnd: N.C6, dur: 0.22, delay: 0.2, vol: 0.3, wave: "sine", decay: 4 })
  ),

  // 🎁 reward redeem — gentle harp gliss
  "reward": mix(
    tone({ freq: N.C5, dur: 0.3, delay: 0.0, vol: 0.25, wave: "sine", decay: 3 }),
    tone({ freq: N.E5, dur: 0.3, delay: 0.08, vol: 0.25, wave: "sine", decay: 3 }),
    tone({ freq: N.G5, dur: 0.3, delay: 0.16, vol: 0.25, wave: "sine", decay: 3 }),
    tone({ freq: N.C6, dur: 0.5, delay: 0.24, vol: 0.3, wave: "sine", decay: 2.5 })
  ),
};

mkdirSync("public/sounds", { recursive: true });
for (const [name, samples] of Object.entries(sounds)) {
  writeFileSync(`public/sounds/${name}.wav`, toWav(samples));
}
console.log(`Generated ${Object.keys(sounds).length} sounds in public/sounds/:`, Object.keys(sounds).join(", "));
