"use client";

/**
 * Device-only evidence photos (V1.3). Never synced to cloud — the product
 * intentionally does not collect this data. Stored per child in localStorage,
 * capped to avoid quota bloat.
 */

const KEY = (childId) => `luk_photos_${childId}`;
const MAX_PHOTOS = 20;

function read(childId) {
  try {
    return JSON.parse(localStorage.getItem(KEY(childId)) || "{}");
  } catch {
    return {};
  }
}

/** @param {string} childId @param {string} taskId @param {string} dataUrl */
export function saveLocalPhoto(childId, taskId, dataUrl) {
  if (!childId || !taskId || !dataUrl) return;
  try {
    const map = read(childId);
    map[taskId] = { dataUrl, ts: Date.now() };
    // trim oldest if over cap
    const entries = Object.entries(map).sort((a, b) => b[1].ts - a[1].ts).slice(0, MAX_PHOTOS);
    localStorage.setItem(KEY(childId), JSON.stringify(Object.fromEntries(entries)));
  } catch {
    /* quota / unavailable — non-critical, photos are optional */
  }
}

/** @returns {string|null} dataUrl */
export function getLocalPhoto(childId, taskId) {
  return read(childId)[taskId]?.dataUrl || null;
}

export function clearLocalPhotos(childId) {
  try {
    localStorage.removeItem(KEY(childId));
  } catch {
    /* ignore */
  }
}
