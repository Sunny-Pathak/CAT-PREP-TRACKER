/**
 * Utilities for text processing, sanitization and cyber security guards
 */

// Regular expression covering emoji ranges: standard emojis, symbols, pictographs, transport, flags, modifiers
const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{200D}\u{FE0F}]/gu;

/**
 * Strips all emojis from a given string.
 * @param {string} str - Input text
 * @returns {string} Clean text without emojis
 */
export function stripEmojis(str) {
  if (!str || typeof str !== 'string') return '';
  return str.replace(EMOJI_REGEX, '');
}

/**
 * Strips emojis, trims whitespace, and clamps string length.
 * @param {string} str - Input text
 * @param {number} maxLength - Maximum allowable characters
 * @returns {string} Sanitized string
 */
export function sanitizeText(str, maxLength = 300) {
  if (!str || typeof str !== 'string') return '';
  const cleaned = stripEmojis(str).trim();
  return maxLength > 0 ? cleaned.slice(0, maxLength) : cleaned;
}

/**
 * Validates and sanitizes URLs to prevent javascript:, data:text/html, or malicious protocols.
 * Strictly whitelists:
 * - https://
 * - blob:
 * - Safe image base64 data URIs: data:image/(png|jpeg|jpg|webp|gif);base64,
 * Upgrades http:// to https:// when possible.
 *
 * @param {string} url - Candidate URL
 * @returns {string} Safe URL or empty string if invalid/malicious
 */
export function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  // Safe HTTPS URL
  if (/^https:\/\/[^\s<>"'`]+$/i.test(trimmed)) {
    return trimmed;
  }

  // Automatic upgrade from HTTP to HTTPS
  if (/^http:\/\/[^\s<>"'`]+$/i.test(trimmed)) {
    return trimmed.replace(/^http:\/\//i, 'https://');
  }

  // Blob URLs
  if (/^blob:https?:\/\/[^\s<>"'`]+$/i.test(trimmed)) {
    return trimmed;
  }

  // Safe base64 image data URIs only (never text/html, svg with scripts, etc.)
  if (/^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(trimmed)) {
    return trimmed;
  }

  return '';
}

/**
 * Verifies that a Firestore document ID contains no path traversal (slashes)
 * and conforms to safe identifier boundaries.
 * @param {string} id - Candidate ID
 * @returns {boolean} True if safe document ID
 */
export function isValidDocumentId(id) {
  if (!id || typeof id !== 'string') return false;
  const trimmed = id.trim();
  if (trimmed.length === 0 || trimmed.length > 128) return false;
  // Firestore rejects slashes in document IDs (they delimit collections/subcollections)
  return !trimmed.includes('/') && !trimmed.includes('\\') && !trimmed.includes('..');
}

/**
 * Recursively removes dangerous prototype pollution keys (__proto__, constructor, prototype)
 * from untrusted JSON objects or parsed backup payloads.
 * @param {any} obj - Input object or primitive
 * @returns {any} Sanitized clone with prototype pollution vectors stripped
 */
export function sanitizeObjectForPrototypePollution(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObjectForPrototypePollution);
  }

  const cleanObj = Object.create(null);
  for (const [key, value] of Object.entries(obj)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue; // Strip prototype pollution keys
    }
    cleanObj[key] = sanitizeObjectForPrototypePollution(value);
  }

  return cleanObj;
}
