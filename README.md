# stripe-search-ql

A TypeScript query builder library for easily constructing queries for the Stripe Search API.

## Installation

```bash
npm install stripe-search-ql
```

## Usage

### Basic Examples

```typescript
import { stripeSearch } from "stripe-search-ql";

// Exact match search
const query = stripeSearch()
  .field("email")
  .equals("amy@rocketrides.io")
  .build();
// => 'email:"amy@rocketrides.io"'

// Numeric comparison
const amountQuery = stripeSearch()
  .field("amount")
  .greaterThan(1000)
  .build();
// => 'amount>1000'

// Substring match
const substringQuery = stripeSearch()
  .field("email")
  .contains("amy")
  .build();
// => 'email~"amy"'
```

### Combining Multiple Conditions

```typescript
// AND operator
const andQuery = stripeSearch()
  .field("email")
  .equals("amy@rocketrides.io")
  .and()
  .field("currency")
  .equals("usd")
  .build();
// => 'email:"amy@rocketrides.io" AND currency:"usd"'

// OR operator
const orQuery = stripeSearch()
  .field("currency")
  .equals("usd")
  .or()
  .field("currency")
  .equals("eur")
  .build();
// => 'currency:"usd" OR currency:"eur"'
```

### Metadata Search

```typescript
// Exact match for metadata
const metadataQuery = stripeSearch()
  .metadata("donation-id")
  .equals("asdf-jkl")
  .build();
// => 'metadata["donation-id"]:"asdf-jkl"'

// Substring match for metadata
const metadataSubstringQuery = stripeSearch()
  .metadata("key")
  .contains("value")
  .build();
// => 'metadata["key"]~"value"'
```

### Negation Search

```typescript
// Field negation
const negatedQuery = stripeSearch()
  .not("currency")
  .equals("jpy")
  .build();
// => '-currency:"jpy"'

// Metadata negation
const negatedMetadataQuery = stripeSearch()
  .notMetadata("donation-id")
  .equals("asdf-jkl")
  .build();
// => '-metadata["donation-id"]:"asdf-jkl"'
```

### NULL Value Checks

```typescript
// Check if field is NULL
const nullCheckQuery = stripeSearch()
  .field("url")
  .isNull()
  .build();
// => 'url:null'

// Check if metadata key does not exist
const metadataNullQuery = stripeSearch()
  .notMetadata("donation-id")
  .isNull()
  .build();
// => '-metadata["donation-id"]:null'
```

### Numeric Comparison Operators

```typescript
// Greater than
stripeSearch().field("amount").greaterThan(1000).build();
// => 'amount>1000'

// Less than
stripeSearch().field("amount").lessThan(1000).build();
// => 'amount<1000'

// Greater than or equal
stripeSearch().field("amount").greaterThanOrEqual(1000).build();
// => 'amount>=1000'

// Less than or equal
stripeSearch().field("amount").lessThanOrEqual(1000).build();
// => 'amount<=1000'
```

### Complex Query Examples

```typescript
// Combining multiple conditions
const complexQuery = stripeSearch()
  .field("email")
  .equals("amy@rocketrides.io")
  .and()
  .metadata("donation-id")
  .equals("asdf-jkl")
  .and()
  .field("amount")
  .greaterThan(1000)
  .build();
// => 'email:"amy@rocketrides.io" AND metadata["donation-id"]:"asdf-jkl" AND amount>1000'
```

## API Reference

### `stripeSearch()`

Creates a new query builder instance.

**Returns**: `QueryBuilder` instance

### `QueryBuilder`

#### Field Search

- `field(field: string): FieldBuilder` - Specify a field to build search conditions
- `not(field: string): FieldBuilder` - Specify a negated field to build search conditions

#### Metadata Search

- `metadata(key: string): MetadataFieldBuilder` - Specify a metadata field to build search conditions
- `notMetadata(key: string): MetadataFieldBuilder` - Specify a negated metadata field to build search conditions

#### Logical Operators

- `and(): QueryBuilder` - Add AND operator
- `or(): QueryBuilder` - Add OR operator

#### Others

- `build(): string` - Returns the constructed query as a string
- `reset(): QueryBuilder` - Reset the query

### `FieldBuilder`

- `equals(value: string | number | null): QueryBuilder` - Exact match (`:`)
- `contains(value: string): QueryBuilder` - Substring match (`~`, minimum 3 characters)
- `greaterThan(value: number): QueryBuilder` - Greater than (`>`)
- `lessThan(value: number): QueryBuilder` - Less than (`<`)
- `greaterThanOrEqual(value: number): QueryBuilder` - Greater than or equal (`>=`)
- `lessThanOrEqual(value: number): QueryBuilder` - Less than or equal (`<=`)
- `isNull(): QueryBuilder` - NULL value check

### `MetadataFieldBuilder`

- `equals(value: string | number | null): QueryBuilder` - Exact match (`:`)
- `contains(value: string): QueryBuilder` - Substring match (`~`, minimum 3 characters)
- `isNull(): QueryBuilder` - NULL value check (when metadata key does not exist)

## Integration with Stripe Search API

The constructed query can be used with the Stripe SDK or API client.

```typescript
import { stripeSearch } from "stripe-search-ql";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Build query
const query = stripeSearch()
  .field("email")
  .equals("customer@example.com")
  .build();

// Search with Stripe API
const customers = await stripe.customers.search({
  query: query,
});
```

## Limitations

- Substring match (`~`) requires a minimum of 3 characters
- You cannot mix `AND` and `OR` in the same query (Stripe Search API limitation)
- Parentheses for specifying precedence are not supported (Stripe Search API limitation)

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm test

# Test (watch mode)
npm run test:watch

# Linter
npm run lint

# Formatter
npm run format

# Type check
npm run typecheck
```

## License

MIT
