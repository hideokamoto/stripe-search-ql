/**
 * Common function to escape a string and wrap it in quotes
 * @param value String to escape
 * @returns Escaped string (wrapped in quotes)
 */
function escapeAndQuote(value: string): string {
  // Escape backslashes and double quotes
  const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `"${escaped}"`;
}

/**
 * Escape a string value and wrap it in quotes
 * @param value String value to escape
 * @returns Escaped string value
 */
export function escapeStringValue(value: string): string {
  return escapeAndQuote(value);
}

/**
 * Escape a metadata key
 * @param key Metadata key
 * @returns Escaped metadata key
 */
export function escapeMetadataKey(key: string): string {
  return escapeAndQuote(key);
}

/**
 * Determine if a value is a string and format it appropriately
 * @param value Value to format
 * @returns String representation of the formatted value
 */
export function formatValue(value: string | number | null): string {
  if (value === null) {
    return "null";
  }
  if (typeof value === "number") {
    return value.toString();
  }
  return escapeStringValue(value);
}
