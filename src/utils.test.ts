import * as fc from "fast-check";
import { describe, expect, it } from "vitest";
import { escapeMetadataKey, escapeStringValue, formatValue } from "./utils.js";

describe("utils", () => {
  describe("escapeStringValue", () => {
    it("should escape a normal string", () => {
      expect(escapeStringValue("test")).toBe('"test"');
    });

    it("should escape a string containing quotes", () => {
      expect(escapeStringValue('test"value')).toBe('"test\\"value"');
    });

    it("should escape a string containing backslashes", () => {
      expect(escapeStringValue("test\\value")).toBe('"test\\\\value"');
    });

    // プロパティベースドテスト: 任意の文字列に対して、結果は常にダブルクォートで囲まれている
    it("should always wrap result in double quotes (PBT)", () => {
      fc.assert(
        fc.property(fc.string(), (str) => {
          const result = escapeStringValue(str);
          expect(result.startsWith('"')).toBe(true);
          expect(result.endsWith('"')).toBe(true);
          expect(result.length).toBeGreaterThanOrEqual(2);
        })
      );
    });

    // プロパティベースドテスト: エスケープされた文字列を元に戻すと元の文字列になる
    it("should preserve original string when unescaped (PBT)", () => {
      fc.assert(
        fc.property(fc.string(), (str) => {
          const escaped = escapeStringValue(str);
          // 前後のクォートを削除
          const unquoted = escaped.slice(1, -1);
          // エスケープを解除
          const unescaped = unquoted.replace(/\\\\/g, "\\").replace(/\\"/g, '"');
          expect(unescaped).toBe(str);
        })
      );
    });

    // プロパティベースドテスト: バックスラッシュとダブルクォートが正しくエスケープされる
    it("should escape backslashes and quotes correctly (PBT)", () => {
      fc.assert(
        fc.property(fc.string(), (str) => {
          const result = escapeStringValue(str);
          // エスケープされていないバックスラッシュやダブルクォートが存在しないことを確認
          const unquoted = result.slice(1, -1);
          // 連続するバックスラッシュの数をカウントして、エスケープが正しいことを確認
          let i = 0;
          while (i < unquoted.length) {
            if (unquoted[i] === "\\") {
              // バックスラッシュの場合は、次の文字が \ または " である必要がある
              expect(i + 1).toBeLessThan(unquoted.length);
              expect(["\\", '"']).toContain(unquoted[i + 1]);
              i += 2;
            } else if (unquoted[i] === '"') {
              // エスケープされていないダブルクォートは存在しない（このブランチは到達すべきではない）
              expect.fail(`Unescaped quote found at position ${i}`);
            } else {
              i += 1;
            }
          }
        })
      );
    });

    // 空文字列も正しく処理される
    it("should handle empty string correctly", () => {
      expect(escapeStringValue("")).toBe('""');
    });

    // プロパティベースドテスト: 特殊文字を含む文字列も正しく処理される
    it("should handle strings with special characters (PBT)", () => {
      fc.assert(
        fc.property(
          fc.string().filter((s) => s.includes('"') || s.includes("\\")),
          (str) => {
            const result = escapeStringValue(str);
            expect(result.startsWith('"')).toBe(true);
            expect(result.endsWith('"')).toBe(true);
          }
        )
      );
    });

    // プロパティベースドテスト: 非常に長い文字列も正しく処理される
    it("should handle very long strings (PBT)", () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1000, maxLength: 10000 }), (str) => {
          const result = escapeStringValue(str);
          expect(result.startsWith('"')).toBe(true);
          expect(result.endsWith('"')).toBe(true);
        })
      );
    });
  });

  describe("escapeMetadataKey", () => {
    it("should escape a normal key", () => {
      expect(escapeMetadataKey("test")).toBe('"test"');
    });

    it("should escape a key containing quotes", () => {
      expect(escapeMetadataKey('test"key')).toBe('"test\\"key"');
    });

    // プロパティベースドテスト: escapeStringValueと同じ動作をする
    it("should behave identically to escapeStringValue (PBT)", () => {
      fc.assert(
        fc.property(fc.string(), (str) => {
          expect(escapeMetadataKey(str)).toBe(escapeStringValue(str));
        })
      );
    });
  });

  describe("formatValue", () => {
    it("should format a string value", () => {
      expect(formatValue("test")).toBe('"test"');
    });

    it("should format a numeric value", () => {
      expect(formatValue(1000)).toBe("1000");
    });

    it("should format a NULL value", () => {
      expect(formatValue(null)).toBe("null");
    });

    // プロパティベースドテスト: 任意の文字列に対して、formatValueはescapeStringValueと同じ結果を返す
    it("should format string values identically to escapeStringValue (PBT)", () => {
      fc.assert(
        fc.property(fc.string(), (str) => {
          expect(formatValue(str)).toBe(escapeStringValue(str));
        })
      );
    });

    // プロパティベースドテスト: 任意の数値に対して、文字列表現を返す
    it("should format numeric values as string representation (PBT)", () => {
      fc.assert(
        fc.property(fc.integer(), (num) => {
          const result = formatValue(num);
          expect(result).toBe(num.toString());
          expect(result).not.toContain('"');
        })
      );
    });

    // プロパティベースドテスト: 浮動小数点数も正しく処理される
    it("should format floating point numbers correctly (PBT)", () => {
      fc.assert(
        fc.property(fc.float(), (num) => {
          const result = formatValue(num);
          expect(result).toBe(num.toString());
          expect(result).not.toContain('"');
        })
      );
    });

    // ゼロも正しく処理される
    it("should format zero correctly", () => {
      expect(formatValue(0)).toBe("0");
      expect(formatValue(-0)).toBe("0");
    });

    // プロパティベースドテスト: 非常に大きな数値も正しく処理される
    it("should handle very large numbers (PBT)", () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.integer({ min: Number.MIN_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER }),
            fc.float()
          ),
          (num) => {
            const result = formatValue(num);
            expect(result).toBe(num.toString());
          }
        )
      );
    });

    // プロパティベースドテスト: 文字列、数値、nullのいずれかに対して常に文字列を返す
    it("should always return a string (PBT)", () => {
      fc.assert(
        fc.property(fc.oneof(fc.string(), fc.integer(), fc.float(), fc.constant(null)), (value) => {
          const result = formatValue(value);
          expect(typeof result).toBe("string");
          expect(result.length).toBeGreaterThan(0);
        })
      );
    });

    // プロパティベースドテスト: 数値の文字列はクォートされない
    it("should not quote numeric values (PBT)", () => {
      fc.assert(
        fc.property(fc.oneof(fc.integer(), fc.float()), (num) => {
          const result = formatValue(num);
          expect(result).not.toContain('"');
          expect(result).not.toContain("'");
        })
      );
    });

    // プロパティベースドテスト: 文字列は常にクォートされる
    it("should always quote string values (PBT)", () => {
      fc.assert(
        fc.property(fc.string(), (str) => {
          const result = formatValue(str);
          expect(result.startsWith('"')).toBe(true);
          expect(result.endsWith('"')).toBe(true);
        })
      );
    });
  });
});
