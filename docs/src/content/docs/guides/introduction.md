---
title: Introduction
description: stripe-search-ql — TypeScript query builder for Stripe Search API
---

# stripe-search-ql

`stripe-search-ql` is a TypeScript query builder library for constructing queries for the [Stripe Search API](https://stripe.com/docs/search).

## Why use this library?

The Stripe Search API accepts a query string with its own syntax. Writing these strings by hand is error-prone and difficult to test. `stripe-search-ql` provides a fluent, type-safe API to build these queries programmatically.

```typescript
import { stripeQuery } from "stripe-search-ql";

const query = stripeQuery()
  .field("email").equals("amy@rocketrides.io")
  .and()
  .field("amount").greaterThan(1000)
  .build();
// => 'email:"amy@rocketrides.io" AND amount>1000'
```

## Features

- **Type-safe** — Full TypeScript support with strict types
- **Fluent API** — Method chaining for readable query construction
- **Domain-specific builders** — `customerQuery()` for Customer-specific fields
- **Charge templates** — Pre-built query templates for common Charge searches
- **Tested** — Comprehensive test suite

## Limitations

The following are constraints imposed by the Stripe Search API itself:

- Substring match (`~`) requires a minimum of **3 characters**
- You **cannot mix `AND` and `OR`** in the same query
- Parentheses for grouping are **not supported**

## Next steps

- [Installation](/guides/installation/)
- [Basic Usage](/guides/basic-usage/)
- [API Reference](/api/)
