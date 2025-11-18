/**
 * 文字列値をエスケープして引用符で囲む
 * @param value エスケープする文字列値
 * @returns エスケープされた文字列値
 */
export function escapeStringValue(value: string): string {
  // 引用符内の引用符をエスケープ
  const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `"${escaped}"`;
}

/**
 * メタデータキーをエスケープする
 * @param key メタデータキー
 * @returns エスケープされたメタデータキー
 */
export function escapeMetadataKey(key: string): string {
  // メタデータキー内の引用符をエスケープ
  const escaped = key.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `"${escaped}"`;
}

/**
 * 値が文字列かどうかを判定し、適切にフォーマットする
 * @param value フォーマットする値
 * @returns フォーマットされた値の文字列表現
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

