/**
 * 文字列をエスケープして引用符で囲む共通関数
 * @param value エスケープする文字列
 * @returns エスケープされた文字列（引用符で囲まれた）
 */
function escapeAndQuote(value: string): string {
  // バックスラッシュとダブルクォートをエスケープ
  const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `"${escaped}"`;
}

/**
 * 文字列値をエスケープして引用符で囲む
 * @param value エスケープする文字列値
 * @returns エスケープされた文字列値
 */
export function escapeStringValue(value: string): string {
  return escapeAndQuote(value);
}

/**
 * メタデータキーをエスケープする
 * @param key メタデータキー
 * @returns エスケープされたメタデータキー
 */
export function escapeMetadataKey(key: string): string {
  return escapeAndQuote(key);
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
