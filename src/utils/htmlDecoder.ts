/**
 * Decodes HTML entities returned by the OpenTDB API.
 * Uses a temporary textarea element for browser-based decoding.
 */
export function decodeHtml(html: string): string {
  if (!html) return '';
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}
