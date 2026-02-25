import { Args, Command, Flags, ux } from "@oclif/core";
import { Stack } from "../stack.js";

type SupportedResource = "customers" | "charges" | "payment_intents";

/**
 * `deploy` command: search for Stripe resources matching a query and display them.
 *
 * Supports --dry-run (issue 3.5) to preview the API call without executing it.
 */
export default class Deploy extends Command {
  static description =
    "Search and display Stripe resources matching a search query";

  static examples = [
    "<%= config.bin %> deploy customers email:'test@example.com'",
    "<%= config.bin %> deploy charges status:'failed'",
    "<%= config.bin %> deploy payment_intents status:'requires_payment_method' --dry-run",
  ];

  static args = {
    resource: Args.string({
      description: "Resource type to search (customers, charges, payment_intents)",
      required: true,
      options: ["customers", "charges", "payment_intents"],
    }),
    query: Args.string({
      description: "Stripe Search API query string",
      required: false,
      default: "",
    }),
  };

  static flags = {
    "dry-run": Flags.boolean({
      description:
        "Preview the API call that would be executed without actually running it",
      default: false,
    }),
    limit: Flags.integer({
      description: "Maximum number of results to return",
      default: 10,
      min: 1,
      max: 100,
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Deploy);
    const resource = args.resource as SupportedResource;
    const query = args.query ?? "";
    const limit = flags.limit;

    // Issue 3.5: --dry-run shows what API call would be made without executing it
    if (flags["dry-run"]) {
      this.log("[Dry Run] The following Stripe Search API call would be executed:");
      this.log("");
      this.log(`  Resource : ${resource}`);
      this.log(`  Query    : ${query || "(none — returns all)"}`);
      this.log(`  Limit    : ${limit}`);
      this.log("");
      this.log("No API call was made. Remove --dry-run to execute.");
      return;
    }

    let stack: Stack;
    try {
      stack = new Stack();
    } catch (error) {
      // Issue 3.4: Stack constructor provides an actionable message; surface it cleanly
      this.error((error as Error).message, { exit: 1 });
    }

    ux.action.start(`Searching ${resource}`);
    try {
      const results = await searchResource(stack, resource, query, limit);
      ux.action.stop();

      if (results.data.length === 0) {
        this.log("No resources found matching the query.");
        return;
      }

      this.log(`Found ${results.data.length} result(s):\n`);
      for (const item of results.data) {
        this.log(JSON.stringify(item, null, 2));
      }
    } catch (error) {
      ux.action.stop("failed");
      this.error((error as Error).message, { exit: 1 });
    }
  }
}

async function searchResource(
  stack: Stack,
  resource: SupportedResource,
  query: string,
  limit: number
): Promise<{ data: unknown[] }> {
  const params = { query, limit } as Parameters<
    typeof stack.stripe.customers.search
  >[0];

  switch (resource) {
    case "customers":
      return stack.stripe.customers.search(params);
    case "charges":
      return stack.stripe.charges.search(params);
    case "payment_intents":
      return stack.stripe.paymentIntents.search(params);
  }
}
