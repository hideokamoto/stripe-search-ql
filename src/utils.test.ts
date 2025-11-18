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
  });

  describe("escapeMetadataKey", () => {
    it("should escape a normal key", () => {
      expect(escapeMetadataKey("test")).toBe('"test"');
    });

    it("should escape a key containing quotes", () => {
      expect(escapeMetadataKey('test"key')).toBe('"test\\"key"');
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
  });
});
