import { SearchQueryBuilder, stripeQuery } from "./query-builder.js";

/**
 * Common query templates for Stripe Charges
 */
export const chargeTemplates = {
  /**
   * Query for failed charges in the last N days
   * @param days Number of days to look back
   * @returns SearchQueryBuilder instance
   */
  failedInLastDays(days: number): SearchQueryBuilder {
    const timestamp = Math.floor(Date.now() / 1000) - days * 24 * 60 * 60;
    return stripeQuery().field("status").equals("failed").and().field("created").greaterThanOrEqual(timestamp);
  },

  /**
   * Query for succeeded charges in the last N days
   * @param days Number of days to look back
   * @returns SearchQueryBuilder instance
   */
  succeededInLastDays(days: number): SearchQueryBuilder {
    const timestamp = Math.floor(Date.now() / 1000) - days * 24 * 60 * 60;
    return stripeQuery().field("status").equals("succeeded").and().field("created").greaterThanOrEqual(timestamp);
  },

  /**
   * Query for high-value charges (amount >= threshold)
   * @param amount Minimum amount threshold
   * @returns SearchQueryBuilder instance
   */
  highValue(amount: number): SearchQueryBuilder {
    return stripeQuery().field("amount").greaterThanOrEqual(amount);
  },

  /**
   * Query for charges with amount in a specific range
   * @param min Minimum amount
   * @param max Maximum amount
   * @returns SearchQueryBuilder instance
   */
  amountBetween(min: number, max: number): SearchQueryBuilder {
    return stripeQuery().field("amount").between(min, max);
  },

  /**
   * Query for charges in a specific currency
   * @param currency Currency code (e.g., "usd", "eur")
   * @returns SearchQueryBuilder instance
   */
  byCurrency(currency: string): SearchQueryBuilder {
    return stripeQuery().field("currency").equals(currency);
  },
};
