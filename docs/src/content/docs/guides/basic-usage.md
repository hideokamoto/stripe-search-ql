---
title: Basic Usage
description: How to use stripeQuery() to build Stripe Search API queries
---

The `stripeQuery()` factory function creates a `SearchQueryBuilder` instance. Use it to construct queries for any Stripe Search API endpoint.

## Exact match

Use `.field(name).equals(value)` to match a field exactly:

```typescript
import { stripeQuery } from "stripe-search-ql";

const query = stripeQuery()
  .field("email")
  .equals("amy@rocketrides.io")
  .build();
// => 'email:"amy@rocketrides.io"'
```

## Substring match

Use `.field(name).contains(value)` for a partial string match (minimum 3 characters):

```typescript
const query = stripeQuery()
  .field("email")
  .contains("rocket")
  .build();
// => 'email~"rocket"'
```

## Numeric comparisons

```typescript
// Greater than
stripeQuery().field("amount").greaterThan(1000).build();
// => 'amount>1000'

// Less than
stripeQuery().field("amount").lessThan(5000).build();
// => 'amount<5000'

// Greater than or equal
stripeQuery().field("amount").greaterThanOrEqual(1000).build();
// => 'amount>=1000'

// Less than or equal
stripeQuery().field("amount").lessThanOrEqual(5000).build();
// => 'amount<=5000'

// Range (between)
stripeQuery().field("amount").between(1000, 5000).build();
// => 'amount>=1000 AND amount<=5000'
```

## NULL check

```typescript
const query = stripeQuery()
  .field("description")
  .isNull()
  .build();
// => 'description:null'
```

## Negation

Use `.not(field)` to negate a field condition:

```typescript
const query = stripeQuery()
  .not("currency")
  .equals("jpy")
  .build();
// => '-currency:"jpy"'
```

## Combining conditions

Use `.and()` or `.or()` to combine multiple conditions. Note: you cannot mix AND and OR in the same query.

```typescript
// AND
const andQuery = stripeQuery()
  .field("email").equals("amy@rocketrides.io")
  .and()
  .field("currency").equals("usd")
  .build();
// => 'email:"amy@rocketrides.io" AND currency:"usd"'

// OR
const orQuery = stripeQuery()
  .field("currency").equals("usd")
  .or()
  .field("currency").equals("eur")
  .build();
// => 'currency:"usd" OR currency:"eur"'
```

## Metadata search

```typescript
// Exact match on metadata
const query = stripeQuery()
  .metadata("order-id")
  .equals("ord_123")
  .build();
// => 'metadata["order-id"]:"ord_123"'

// Substring match on metadata
const substringQuery = stripeQuery()
  .metadata("notes")
  .contains("vip")
  .build();
// => 'metadata["notes"]~"vip"'

// Negated metadata
const negatedQuery = stripeQuery()
  .notMetadata("internal-tag")
  .equals("test")
  .build();
// => '-metadata["internal-tag"]:"test"'
```

## Complex query example

```typescript
const query = stripeQuery()
  .field("email").equals("amy@rocketrides.io")
  .and()
  .metadata("donation-id").equals("asdf-jkl")
  .and()
  .field("amount").greaterThan(1000)
  .build();
// => 'email:"amy@rocketrides.io" AND metadata["donation-id"]:"asdf-jkl" AND amount>1000'
```

## Resetting a query

Call `.reset()` to clear the builder and start fresh:

```typescript
const builder = stripeQuery();
builder.field("email").equals("a@b.com");
builder.reset();
builder.field("currency").equals("usd");
const query = builder.build();
// => 'currency:"usd"'
```
