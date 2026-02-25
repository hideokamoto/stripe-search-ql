import Stripe from "stripe";

/**
 * Configuration options for the Stack class
 */
export interface StackConfig {
  apiKey?: string;
}

/**
 * Stack manages the Stripe API connection used by CLI commands.
 *
 * The API key is resolved in the following order:
 * 1. Explicitly passed `apiKey` in config
 * 2. `STRIPE_API_KEY` environment variable
 */
export class Stack {
  readonly stripe: Stripe;

  constructor(config?: StackConfig) {
    const apiKey = config?.apiKey ?? process.env.STRIPE_API_KEY;

    if (!apiKey) {
      // Issue 3.4: Provide a helpful, actionable error message instead of a bare throw
      throw new Error(
        [
          "Stripe API key not found.",
          "",
          "Please provide your Stripe API key using one of the following methods:",
          "",
          "  1. Set the STRIPE_API_KEY environment variable:",
          "       export STRIPE_API_KEY=sk_test_...",
          "",
          "  2. Pass it explicitly when creating a Stack:",
          "       new Stack({ apiKey: 'sk_test_...' })",
          "",
          "You can find your API keys at: https://dashboard.stripe.com/apikeys",
        ].join("\n")
      );
    }

    this.stripe = new Stripe(apiKey);
  }
}
