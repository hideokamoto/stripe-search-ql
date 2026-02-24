---
title: Installation
description: How to install stripe-search-ql
---

## Requirements

- Node.js 18 or later
- TypeScript 5.0 or later (recommended)

## Install

```bash
npm install stripe-search-ql
```

```bash
yarn add stripe-search-ql
```

```bash
pnpm add stripe-search-ql
```

## Import

```typescript
// Named exports
import { stripeQuery, customerQuery, chargeTemplates } from "stripe-search-ql";

// Types
import type { QueryClause, LogicalOperator } from "stripe-search-ql";
```

## Use with Stripe SDK

Install the Stripe SDK alongside this library:

```bash
npm install stripe stripe-search-ql
```

```typescript
import Stripe from "stripe";
import { stripeQuery } from "stripe-search-ql";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const query = stripeQuery()
  .field("email")
  .equals("customer@example.com")
  .build();

const customers = await stripe.customers.search({ query });
```
