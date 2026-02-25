---
title: Charge Queries
description: Using chargeTemplates to build common Stripe Charge Search queries
---

`chargeTemplates` provides pre-built query templates for common [Stripe Charge Search](https://stripe.com/docs/search#query-fields-for-charges) scenarios.

## Import

```typescript
import { chargeTemplates } from "stripe-search-ql";
```

## Available templates

### `failedInLastDays(days)`

Query for failed charges in the last N days:

```typescript
const query = chargeTemplates.failedInLastDays(7).build();
// => 'status:"failed" AND created>=<7-days-ago-timestamp>'
```

### `succeededInLastDays(days)`

Query for successful charges in the last N days:

```typescript
const query = chargeTemplates.succeededInLastDays(30).build();
// => 'status:"succeeded" AND created>=<30-days-ago-timestamp>'
```

### `highValue(amount)`

Query for charges at or above a given amount (in the smallest currency unit, e.g. cents):

```typescript
const query = chargeTemplates.highValue(10000).build();
// => 'amount>=10000'
```

### `amountBetween(min, max)`

Query for charges within an amount range:

```typescript
const query = chargeTemplates.amountBetween(1000, 5000).build();
// => 'amount>=1000 AND amount<=5000'
```

### `byCurrency(currency)`

Query for charges in a specific currency:

```typescript
const query = chargeTemplates.byCurrency("usd").build();
// => 'currency:"usd"'
```

## Extending templates

Templates return a `SearchQueryBuilder`, so you can chain additional conditions:

```typescript
import { chargeTemplates } from "stripe-search-ql";

// High-value USD charges in the last 30 days
const failedHighValue = chargeTemplates
  .highValue(10000)
  .and()
  .field("currency").equals("usd")
  .build();
// => 'amount>=10000 AND currency:"usd"'
```

## Use with Stripe SDK

```typescript
import Stripe from "stripe";
import { chargeTemplates } from "stripe-search-ql";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const query = chargeTemplates.failedInLastDays(7).build();

const { data: charges } = await stripe.charges.search({ query });
```
