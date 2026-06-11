/**
 * Normalizes text by removing diacritics (accents) and converting to lowercase.
 * Used for accent-insensitive search matching.
 *
 * @param {string} str - The string to normalize
 * @returns {string} The normalized string without accents, in lowercase
 *
 * @example
 * normalizeText("Información") // => "informacion"
 * normalizeText("Análisis Matemático II") // => "analisis matematico ii"
 */
export function normalizeText(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
