---
title: Customer Queries
description: Using customerQuery() to build Stripe Customer Search queries
---

The `customerQuery()` factory function creates a `CustomerQueryBuilder` — a domain-specific builder with methods that correspond directly to [Stripe Customer Search](https://stripe.com/docs/search#query-fields-for-customers) fields.

## Import

```typescript
import { customerQuery } from "stripe-search-ql";
```

## Searchable fields

| Method | Stripe field | Supported operators |
|--------|-------------|---------------------|
| `.email()` | `email` | equals, contains |
| `.name()` | `name` | equals, contains |
| `.phone()` | `phone` | equals, contains |
| `.description()` | `description` | equals, contains |
| `.created()` | `created` | numeric comparisons |
| `.metadata(key)` | `metadata[key]` | equals, contains, isNull |

## Examples

### Search by email

```typescript
const query = customerQuery()
  .email().equals("amy@rocketrides.io")
  .build();
// => 'email:"amy@rocketrides.io"'
```

### Search by name (partial)

```typescript
const query = customerQuery()
  .name().contains("Amy")
  .build();
// => 'name~"Amy"'
```

### Search by creation date

```typescript
// Customers created after a Unix timestamp
const query = customerQuery()
  .created().greaterThan(1700000000)
  .build();
// => 'created>1700000000'
```

### Search by metadata

```typescript
const query = customerQuery()
  .metadata("plan").equals("enterprise")
  .build();
// => 'metadata["plan"]:"enterprise"'
```

### Combine conditions with AND

```typescript
const query = customerQuery()
  .email().contains("rocketrides")
  .and()
  .metadata("tier").equals("gold")
  .build();
// => 'email~"rocketrides" AND metadata["tier"]:"gold"'
```

### Use with Stripe SDK

```typescript
import Stripe from "stripe";
import { customerQuery } from "stripe-search-ql";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const query = customerQuery()
  .email().equals("amy@rocketrides.io")
  .build();

const { data: customers } = await stripe.customers.search({ query });
```
