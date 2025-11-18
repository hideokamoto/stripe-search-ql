import { describe, expect, it } from "vitest";
import { escapeMetadataKey, escapeStringValue, formatValue } from "./utils.js";

describe("utils", () => {
  describe("escapeStringValue", () => {
    it("通常の文字列をエスケープできる", () => {
      expect(escapeStringValue("test")).toBe('"test"');
    });

    it("引用符を含む文字列をエスケープできる", () => {
      expect(escapeStringValue('test"value')).toBe('"test\\"value"');
    });

    it("バックスラッシュを含む文字列をエスケープできる", () => {
      expect(escapeStringValue("test\\value")).toBe('"test\\\\value"');
    });
  });

  describe("escapeMetadataKey", () => {
    it("通常のキーをエスケープできる", () => {
      expect(escapeMetadataKey("test")).toBe('"test"');
    });

    it("引用符を含むキーをエスケープできる", () => {
      expect(escapeMetadataKey('test"key')).toBe('"test\\"key"');
    });
  });

  describe("formatValue", () => {
    it("文字列値をフォーマットできる", () => {
      expect(formatValue("test")).toBe('"test"');
    });

    it("数値をフォーマットできる", () => {
      expect(formatValue(1000)).toBe("1000");
    });

    it("NULL値をフォーマットできる", () => {
      expect(formatValue(null)).toBe("null");
    });
  });
});

