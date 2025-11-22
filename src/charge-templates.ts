import { type SearchQueryBuilder, stripeQuery } from "./query-builder.js";

/**
 * Helper function to calculate timestamp for N days ago
 * @param days Number of days to look back
 * @returns Unix timestamp
 */
function daysAgoTimestamp(days: number): number {
  return Math.floor(Date.now() / 1000) - days * 24 * 60 * 60;
}

/**
 * Helper function to create a query for charges with a specific status in the last N days
 * @param status Charge status
 * @param days Number of days to look back
 * @returns SearchQueryBuilder instance
 */
function chargesByStatusInLastDays(status: string, days: number): SearchQueryBuilder {
  return stripeQuery()
    .field("status")
    .equals(status)
    .and()
    .field("created")
    .greaterThanOrEqual(daysAgoTimestamp(days));
}

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
    return chargesByStatusInLastDays("failed", days);
  },

  /**
   * Query for succeeded charges in the last N days
   * @param days Number of days to look back
   * @returns SearchQueryBuilder instance
   */
  succeededInLastDays(days: number): SearchQueryBuilder {
    return chargesByStatusInLastDays("succeeded", days);
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
