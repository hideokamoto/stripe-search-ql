import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { chargeTemplates } from "./charge-templates.js";

describe("ChargeTemplates", () => {
  beforeEach(() => {
    // Mock Date.now to return a fixed timestamp
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("failedInLastDays", () => {
    it("should build a query for failed charges in the last 7 days", () => {
      const query = chargeTemplates.failedInLastDays(7).build();

      // 7 days before 2024-01-15 is 2024-01-08
      // 2024-01-08T00:00:00Z = 1704672000
      expect(query).toBe('status:"failed" AND created>=1704672000');
    });

    it("should build a query for failed charges in the last 30 days", () => {
      const query = chargeTemplates.failedInLastDays(30).build();

      // 30 days before 2024-01-15 is 2023-12-16
      // 2023-12-16T00:00:00Z = 1702684800
      expect(query).toBe('status:"failed" AND created>=1702684800');
    });
  });

  describe("succeededInLastDays", () => {
    it("should build a query for succeeded charges in the last 7 days", () => {
      const query = chargeTemplates.succeededInLastDays(7).build();

      expect(query).toBe('status:"succeeded" AND created>=1704672000');
    });
  });

  describe("highValue", () => {
    it("should build a query for charges with amount greater than threshold", () => {
      const query = chargeTemplates.highValue(100000).build();

      expect(query).toBe("amount>=100000");
    });

    it("should build a query for charges with amount greater than 50000", () => {
      const query = chargeTemplates.highValue(50000).build();

      expect(query).toBe("amount>=50000");
    });
  });

  describe("amountBetween", () => {
    it("should build a query for charges with amount in range", () => {
      const query = chargeTemplates.amountBetween(1000, 5000).build();

      expect(query).toBe("amount>=1000 AND amount<=5000");
    });
  });

  describe("byCurrency", () => {
    it("should build a query for charges in USD", () => {
      const query = chargeTemplates.byCurrency("usd").build();

      expect(query).toBe('currency:"usd"');
    });

    it("should build a query for charges in EUR", () => {
      const query = chargeTemplates.byCurrency("eur").build();

      expect(query).toBe('currency:"eur"');
    });
  });

  describe("template combination", () => {
    it("should be able to combine templates with AND", () => {
      // This tests that templates return query builders that can be chained
      const query = chargeTemplates
        .failedInLastDays(7)
        .and()
        .field("amount")
        .greaterThan(5000)
        .build();

      expect(query).toBe('status:"failed" AND created>=1704672000 AND amount>5000');
    });
  });
});
