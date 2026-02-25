import { Args, Command, Flags, ux } from "@oclif/core";
import { confirm } from "../prompt.js";
import { Stack } from "../stack.js";

type SupportedResource = "customers" | "charges" | "payment_intents";

/**
 * `destroy` command: delete Stripe resources matching a search query.
 *
 * Issue 3.3: Instead of exiting with "run with --force flag", the command now
 * shows an interactive Y/N confirmation prompt when --force is not provided.
 *
 * Issue 3.5: Supports --dry-run to preview what would be deleted without
 * actually making any destructive API calls.
 */
export default class Destroy extends Command {
  static description =
    "Delete Stripe resources matching a search query (with confirmation)";

  static examples = [
    "<%= config.bin %> destroy customers email:'test@example.com'",
    "<%= config.bin %> destroy customers email:'test@example.com' --force",
    "<%= config.bin %> destroy charges status:'failed' --dry-run",
  ];

  static args = {
    resource: Args.string({
      description: "Resource type to delete (customers, charges, payment_intents)",
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
    force: Flags.boolean({
      char: "f",
      description: "Skip the interactive confirmation prompt and delete immediately",
      default: false,
    }),
    "dry-run": Flags.boolean({
      description:
        "Preview which resources would be deleted without actually deleting them",
      default: false,
    }),
    limit: Flags.integer({
      description: "Maximum number of resources to delete",
      default: 10,
      min: 1,
      max: 100,
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Destroy);
    const resource = args.resource as SupportedResource;
    const query = args.query ?? "";
    const limit = flags.limit;

    // Issue 3.5: --dry-run previews API calls that would be made
    if (flags["dry-run"]) {
      this.log("[Dry Run] The following resources would be deleted:");
      this.log("");
      this.log(`  Resource : ${resource}`);
      this.log(`  Query    : ${query || "(none — matches all)"}`);
      this.log(`  Limit    : ${limit}`);
      this.log("");
      this.log("No resources were deleted. Remove --dry-run to execute.");
      return;
    }

    // Issue 3.3: Interactive Y/N confirmation instead of exiting with
    // "run with --force flag".  The --force flag still allows skipping it.
    if (!flags.force) {
      const message =
        query
          ? `Are you sure you want to destroy ${resource} matching "${query}"? This cannot be undone.`
          : `Are you sure you want to destroy ALL ${resource}? This cannot be undone.`;

      const confirmed = await confirm(`${message} (y/n)`);
      if (!confirmed) {
        this.log("Destruction cancelled.");
        return;
      }
    }

    let stack: Stack;
    try {
      stack = new Stack();
    } catch (error) {
      // Issue 3.4: Stack provides an actionable error; surface it cleanly
      this.error((error as Error).message, { exit: 1 });
    }

    ux.action.start(`Searching ${resource} to delete`);
    let targets: { id: string }[];
    try {
      const results = await searchResource(stack, resource, query, limit);
      targets = results.data as { id: string }[];
      ux.action.stop();
    } catch (error) {
      ux.action.stop("failed");
      this.error((error as Error).message, { exit: 1 });
    }

    if (targets.length === 0) {
      this.log("No resources found matching the query. Nothing to delete.");
      return;
    }

    this.log(`Deleting ${targets.length} resource(s)...`);
    let deleted = 0;
    let failed = 0;

    for (const target of targets) {
      try {
        await deleteResource(stack, resource, target.id);
        this.log(`  ✓ Deleted ${resource.slice(0, -1)} ${target.id}`);
        deleted++;
      } catch (error) {
        this.warn(`  ✗ Failed to delete ${target.id}: ${(error as Error).message}`);
        failed++;
      }
    }

    this.log("");
    this.log(`Done: ${deleted} deleted, ${failed} failed.`);
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

async function deleteResource(
  stack: Stack,
  resource: SupportedResource,
  id: string
): Promise<void> {
  switch (resource) {
    case "customers":
      await stack.stripe.customers.del(id);
      break;
    case "charges":
      // Charges cannot be deleted via Stripe API; only refunded
      throw new Error(
        `Charges cannot be deleted. Use the Stripe Dashboard to issue a refund for charge ${id}.`
      );
    case "payment_intents":
      await stack.stripe.paymentIntents.cancel(id);
      break;
  }
}
