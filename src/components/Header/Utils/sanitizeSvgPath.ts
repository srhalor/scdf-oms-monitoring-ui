/**
 * Sanitizes an SVG path string by normalizing whitespace
 * and removing unsafe control characters.
 * Only allows valid SVG path commands and numeric values.
 */
export const sanitizeSvgPath = (input: string): string => {
  if (!input || typeof input !== 'string') return '';
  // Remove any characters that aren't valid SVG path commands or numbers
  const sanitized = input.replace(/[^MLHVCSQTAZmlhvcsqtaz0-9.\s,-]/g, '');
  return sanitized.replace(/\s+/g, ' ').trim();
};
