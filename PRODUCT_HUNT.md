# Product Hunt Launch Copy

## Tagline (60 characters max)

Type-safe query builder for the Stripe Search API

## Description (260 characters max)

Stop writing raw Stripe search query strings by hand. stripe-search-ql gives you a fluent, type-safe TypeScript builder with autocomplete, validation, and escaping — so your queries are always correct.

## Topics / Categories

- Developer Tools
- Open Source
- TypeScript
- Stripe
- SaaS

---

## Full Description (Maker's Comment / About)

### The Problem

If you've ever used Stripe's Search API, you know the pain: hand-crafting query strings like `email:"user@example.com" AND metadata["plan"]:"premium" AND amount>5000`. One missing quote, one wrong operator, and your search silently returns the wrong results. There's no autocomplete, no validation, and no safety net.

### The Solution

**stripe-search-ql** is a lightweight TypeScript query builder that lets you construct Stripe Search API queries using a fluent, chainable API — with full type safety and built-in validation.

Instead of writing error-prone strings:

```
email:"amy@rocketrides.io" AND metadata["donation-id"]:"asdf-jkl" AND amount>1000
```

You write expressive, readable code:

```typescript
import { stripeQuery } from "stripe-search-ql";

const query = stripeQuery()
  .field("email").equals("amy@rocketrides.io")
  .and()
  .metadata("donation-id").equals("asdf-jkl")
  .and()
  .field("amount").greaterThan(1000)
  .build();
```

### Key Features

- **Fluent Builder API** — Chain methods naturally: `.field("email").equals("value").and().field("amount").greaterThan(1000)`
- **Type-Safe** — Full TypeScript support with autocomplete in your editor. Catch errors at compile time, not in production.
- **Built-in Validation** — Automatically enforces Stripe's constraints (e.g., substring match requires 3+ characters, can't mix AND/OR operators).
- **Auto-Escaping** — Special characters in values are escaped correctly so your queries never break.
- **Metadata Support** — First-class support for searching Stripe metadata fields, including negation.
- **Pre-built Templates** — Common query patterns for Charges (failed in last N days, high-value transactions, etc.) ready to use out of the box.
- **Zero Dependencies** — Lightweight and fast. No bloat added to your bundle.
- **Works Everywhere** — ESM module that integrates directly with the official Stripe Node.js SDK.

### Who Is This For?

- **Backend developers** building Stripe integrations who want safer, more readable search queries
- **SaaS teams** that need to search customers, charges, invoices, or subscriptions programmatically
- **Anyone tired of debugging malformed Stripe query strings**

### Quick Start

```bash
npm install stripe-search-ql
```

```typescript
import { stripeQuery } from "stripe-search-ql";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Build a type-safe query
const query = stripeQuery()
  .field("email").equals("customer@example.com")
  .and()
  .field("created").greaterThan(1672531200)
  .build();

// Use it directly with Stripe SDK
const results = await stripe.customers.search({ query });
```

### Open Source

stripe-search-ql is MIT-licensed and open source. Contributions, issues, and feature requests are welcome on GitHub.

---

## First Comment (Maker's Comment on Launch Day)

Hey Product Hunt! 👋

I'm Hidetaka, the maker of stripe-search-ql.

I've been building Stripe integrations for years, and one thing that always frustrated me was constructing search queries by hand. The Stripe Search API is powerful, but writing raw query strings is error-prone — missing quotes, wrong operators, and silent failures that are hard to debug.

So I built stripe-search-ql: a tiny TypeScript library that gives you a fluent, chainable API to build Stripe search queries with full type safety and validation.

Here's what makes it different:

🔒 **Type-safe** — Your editor autocompletes every method. If you make a mistake, TypeScript catches it before your code even runs.

✅ **Validates for you** — It knows Stripe's constraints (like "substring match needs 3+ chars" and "you can't mix AND and OR") and throws clear errors instead of letting bad queries through.

🪶 **Zero dependencies** — It's just a query builder. No bloat, no runtime overhead.

I'd love your feedback! What Stripe resources do you search most often? I'm planning to add more pre-built templates based on real-world usage patterns.

GitHub: https://github.com/hideokamoto/stripe-search-ql

---

## Media / Screenshots Suggestions

1. **Hero image**: Code comparison — raw query string vs. stripe-search-ql builder (side by side)
2. **GIF/Video**: Editor autocomplete in action showing type-safe method chaining
3. **Screenshot**: Test suite passing — demonstrates reliability and coverage
4. **Diagram**: Flow from `stripeQuery()` → builder chain → `.build()` → Stripe SDK call

---

## Gallery Image Alt Texts

1. "Side-by-side comparison of raw Stripe query string vs type-safe stripe-search-ql builder code"
2. "TypeScript autocomplete showing available query builder methods in VS Code"
3. "stripe-search-ql integrating with the official Stripe Node.js SDK in 3 lines of code"

---

## Social Media Snippets

### Twitter/X

> Stop hand-writing Stripe search query strings. 🛑
>
> stripe-search-ql gives you a fluent, type-safe TypeScript builder for the Stripe Search API — with validation, escaping, and zero dependencies.
>
> `stripeQuery().field("email").equals("user@example.com").build()`
>
> Open source & MIT licensed.

### Short Pitch (for comments, forums, etc.)

> Building Stripe integrations? stripe-search-ql is a type-safe query builder for the Stripe Search API. Write readable, validated queries instead of error-prone strings. Zero deps, MIT licensed. https://github.com/hideokamoto/stripe-search-ql
