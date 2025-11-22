import { type SearchQueryBuilder, stripeQuery } from "./query-builder.js";

/**
 * Field builder for Customer-specific fields
 */
class CustomerFieldBuilder {
  private customerBuilder: CustomerQueryBuilder;
  private fieldName: string;
  private negated: boolean;

  constructor(customerBuilder: CustomerQueryBuilder, fieldName: string, negated = false) {
    this.customerBuilder = customerBuilder;
    this.fieldName = fieldName;
    this.negated = negated;
  }

  private getBuilder() {
    return this.negated
      ? this.customerBuilder.builder.not(this.fieldName)
      : this.customerBuilder.builder.field(this.fieldName);
  }

  equals(value: string | number | null): CustomerQueryBuilder {
    this.getBuilder().equals(value);
    return this.customerBuilder;
  }

  contains(value: string): CustomerQueryBuilder {
    this.getBuilder().contains(value);
    return this.customerBuilder;
  }

  greaterThan(value: number): CustomerQueryBuilder {
    this.getBuilder().greaterThan(value);
    return this.customerBuilder;
  }

  lessThan(value: number): CustomerQueryBuilder {
    this.getBuilder().lessThan(value);
    return this.customerBuilder;
  }

  greaterThanOrEqual(value: number): CustomerQueryBuilder {
    this.getBuilder().greaterThanOrEqual(value);
    return this.customerBuilder;
  }

  lessThanOrEqual(value: number): CustomerQueryBuilder {
    this.getBuilder().lessThanOrEqual(value);
    return this.customerBuilder;
  }

  between(min: number, max: number): CustomerQueryBuilder {
    this.getBuilder().between(min, max);
    return this.customerBuilder;
  }

  isNull(): CustomerQueryBuilder {
    this.getBuilder().isNull();
    return this.customerBuilder;
  }

  not(): CustomerFieldBuilder {
    return new CustomerFieldBuilder(this.customerBuilder, this.fieldName, true);
  }
}

/**
 * Metadata field builder for Customer queries
 */
class CustomerMetadataFieldBuilder {
  private customerBuilder: CustomerQueryBuilder;
  private key: string;
  private negated: boolean;

  constructor(customerBuilder: CustomerQueryBuilder, key: string, negated = false) {
    this.customerBuilder = customerBuilder;
    this.key = key;
    this.negated = negated;
  }

  private getBuilder() {
    return this.negated
      ? this.customerBuilder.builder.notMetadata(this.key)
      : this.customerBuilder.builder.metadata(this.key);
  }

  equals(value: string | number | null): CustomerQueryBuilder {
    this.getBuilder().equals(value);
    return this.customerBuilder;
  }

  contains(value: string): CustomerQueryBuilder {
    this.getBuilder().contains(value);
    return this.customerBuilder;
  }

  isNull(): CustomerQueryBuilder {
    this.getBuilder().isNull();
    return this.customerBuilder;
  }
}

/**
 * Builder class for constructing Customer-specific Stripe Search API queries
 */
export class CustomerQueryBuilder {
  /** @internal */
  public readonly builder: SearchQueryBuilder;

  constructor() {
    this.builder = stripeQuery();
  }

  /**
   * Search by email field
   */
  email(): CustomerFieldBuilder {
    return new CustomerFieldBuilder(this, "email");
  }

  /**
   * Search by name field
   */
  name(): CustomerFieldBuilder {
    return new CustomerFieldBuilder(this, "name");
  }

  /**
   * Search by phone field
   */
  phone(): CustomerFieldBuilder {
    return new CustomerFieldBuilder(this, "phone");
  }

  /**
   * Search by description field
   */
  description(): CustomerFieldBuilder {
    return new CustomerFieldBuilder(this, "description");
  }

  /**
   * Search by created timestamp field
   */
  created(): CustomerFieldBuilder {
    return new CustomerFieldBuilder(this, "created");
  }

  /**
   * Search by metadata field
   */
  metadata(key: string): CustomerMetadataFieldBuilder {
    return new CustomerMetadataFieldBuilder(this, key);
  }

  /**
   * Add AND operator
   */
  and(): CustomerQueryBuilder {
    this.builder.and();
    return this;
  }

  /**
   * Add OR operator
   */
  or(): CustomerQueryBuilder {
    this.builder.or();
    return this;
  }

  /**
   * Build the query string
   */
  build(): string {
    return this.builder.build();
  }

  /**
   * Reset the query
   */
  reset(): CustomerQueryBuilder {
    this.builder.reset();
    return this;
  }
}

/**
 * Factory function to create a Customer-specific query builder
 */
export function customerQuery(): CustomerQueryBuilder {
  return new CustomerQueryBuilder();
}
