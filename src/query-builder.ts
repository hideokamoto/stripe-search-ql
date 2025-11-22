import type {
  FieldClause,
  LogicalOperator,
  NumericOperator,
  QueryClause,
  StringOperator,
} from "./types.js";
import { escapeMetadataKey, formatValue } from "./utils.js";

/**
 * Builder for constructing field clauses
 */
class FieldBuilder {
  private field: string;
  private negated: boolean;
  private queryBuilder: SearchQueryBuilder;

  constructor(field: string, negated: boolean, queryBuilder: SearchQueryBuilder) {
    this.field = field;
    this.negated = negated;
    this.queryBuilder = queryBuilder;
  }

  /**
   * Exact match operator (`:`)
   * @param value Search value
   * @returns SearchQueryBuilder instance
   */
  equals(value: string | number | null): SearchQueryBuilder {
    return this.addClause(":", value);
  }

  /**
   * Substring match operator (`~`)
   * @param value Search value (minimum 3 characters)
   * @returns SearchQueryBuilder instance
   */
  contains(value: string): SearchQueryBuilder {
    if (value.length < 3) {
      throw new Error("Substring match requires at least 3 characters");
    }
    return this.addClause("~", value);
  }

  /**
   * Greater than operator (`>`)
   * @param value Comparison value
   * @returns SearchQueryBuilder instance
   */
  greaterThan(value: number): SearchQueryBuilder {
    return this.addClause(">", value);
  }

  /**
   * Less than operator (`<`)
   * @param value Comparison value
   * @returns SearchQueryBuilder instance
   */
  lessThan(value: number): SearchQueryBuilder {
    return this.addClause("<", value);
  }

  /**
   * Greater than or equal operator (`>=`)
   * @param value Comparison value
   * @returns SearchQueryBuilder instance
   */
  greaterThanOrEqual(value: number): SearchQueryBuilder {
    return this.addClause(">=", value);
  }

  /**
   * Less than or equal operator (`<=`)
   * @param value Comparison value
   * @returns SearchQueryBuilder instance
   */
  lessThanOrEqual(value: number): SearchQueryBuilder {
    return this.addClause("<=", value);
  }

  /**
   * NULL value check (when field does not exist or is empty)
   * @returns SearchQueryBuilder instance
   */
  isNull(): SearchQueryBuilder {
    return this.addClause(":", null);
  }

  /**
   * Range query (between min and max inclusive)
   * @param min Minimum value
   * @param max Maximum value
   * @returns SearchQueryBuilder instance
   */
  between(min: number, max: number): SearchQueryBuilder {
    this.addClause(">=", min);
    this.queryBuilder.and();
    this.addClause("<=", max);
    return this.queryBuilder;
  }

  /**
   * Add a negated field clause
   * @param operator Operator
   * @param value Value
   * @returns SearchQueryBuilder instance
   */
  private addClause(
    operator: NumericOperator | StringOperator,
    value: string | number | null
  ): SearchQueryBuilder {
    this.queryBuilder.addFieldClause({
      type: "field",
      field: this.field,
      operator,
      value,
      negated: this.negated,
    });
    return this.queryBuilder;
  }
}

/**
 * Metadata field builder
 */
class MetadataFieldBuilder {
  private key: string;
  private negated: boolean;
  private queryBuilder: SearchQueryBuilder;

  constructor(key: string, negated: boolean, queryBuilder: SearchQueryBuilder) {
    this.key = key;
    this.negated = negated;
    this.queryBuilder = queryBuilder;
  }

  /**
   * Add a field clause
   * @param operator Operator
   * @param value Value
   * @returns SearchQueryBuilder instance
   */
  private addClause(operator: StringOperator, value: string | number | null): SearchQueryBuilder {
    const field = `metadata[${escapeMetadataKey(this.key)}]`;
    return this.queryBuilder.addFieldClause({
      type: "field",
      field,
      operator,
      value,
      negated: this.negated,
    });
  }

  /**
   * Exact match operator (`:`)
   * @param value Search value
   * @returns SearchQueryBuilder instance
   */
  equals(value: string | number | null): SearchQueryBuilder {
    return this.addClause(":", value);
  }

  /**
   * Substring match operator (`~`)
   * @param value Search value (minimum 3 characters)
   * @returns SearchQueryBuilder instance
   */
  contains(value: string): SearchQueryBuilder {
    if (value.length < 3) {
      throw new Error("Substring match requires at least 3 characters");
    }
    return this.addClause("~", value);
  }

  /**
   * NULL value check (when metadata key does not exist)
   * @returns SearchQueryBuilder instance
   */
  isNull(): SearchQueryBuilder {
    return this.addClause(":", null);
  }
}

/**
 * Builder class for constructing Stripe Search API queries
 */
export class SearchQueryBuilder {
  private clauses: QueryClause[] = [];
  private logicalOperator: LogicalOperator | null = null;

  /**
   * Add a field clause
   * @param clause Field clause
   * @returns SearchQueryBuilder instance
   */
  addFieldClause(clause: FieldClause): SearchQueryBuilder {
    this.clauses.push(clause);
    return this;
  }

  /**
   * Specify a field to build search conditions
   * @param field Field name
   * @returns FieldBuilder instance
   */
  field(field: string): FieldBuilder {
    return new FieldBuilder(field, false, this);
  }

  /**
   * Specify a negated field to build search conditions
   * @param field Field name
   * @returns FieldBuilder instance
   */
  not(field: string): FieldBuilder {
    return new FieldBuilder(field, true, this);
  }

  /**
   * Specify a metadata field to build search conditions
   * @param key Metadata key
   * @returns MetadataFieldBuilder instance
   */
  metadata(key: string): MetadataFieldBuilder {
    return new MetadataFieldBuilder(key, false, this);
  }

  /**
   * Specify a negated metadata field to build search conditions
   * @param key Metadata key
   * @returns MetadataFieldBuilder instance
   */
  notMetadata(key: string): MetadataFieldBuilder {
    return new MetadataFieldBuilder(key, true, this);
  }

  /**
   * Add AND operator
   * @returns SearchQueryBuilder instance
   * @throws {Error} When OR operator is already used
   */
  and(): SearchQueryBuilder {
    if (this.logicalOperator === "OR") {
      throw new Error("Cannot mix AND and OR operators in a single query");
    }
    this.logicalOperator = "AND";
    this.clauses.push({
      type: "logical",
      operator: "AND",
    });
    return this;
  }

  /**
   * Add OR operator
   * @returns SearchQueryBuilder instance
   * @throws {Error} When AND operator is already used
   */
  or(): SearchQueryBuilder {
    if (this.logicalOperator === "AND") {
      throw new Error("Cannot mix AND and OR operators in a single query");
    }
    this.logicalOperator = "OR";
    this.clauses.push({
      type: "logical",
      operator: "OR",
    });
    return this;
  }

  /**
   * Return the constructed query as a string
   * @returns Query string
   */
  build(): string {
    if (this.clauses.length === 0) {
      return "";
    }

    const parts: string[] = [];
    let lastWasLogical = false;
    let hasFieldClause = false;

    for (const clause of this.clauses) {
      if (clause.type === "field") {
        const prefix = clause.negated ? "-" : "";
        const value = formatValue(clause.value);
        parts.push(`${prefix}${clause.field}${clause.operator}${value}`);
        lastWasLogical = false;
        hasFieldClause = true;
      } else if (clause.type === "logical") {
        // Ignore leading logical operators (when no field clause has been added yet)
        if (!hasFieldClause) {
          continue;
        }
        // Prevent consecutive logical operators
        if (!lastWasLogical) {
          parts.push(clause.operator);
          lastWasLogical = true;
        }
      }
    }

    // Remove trailing logical operator
    if (lastWasLogical) {
      parts.pop();
    }

    return parts.join(" ");
  }

  /**
   * Reset the query
   * @returns SearchQueryBuilder instance
   */
  reset(): SearchQueryBuilder {
    this.clauses = [];
    this.logicalOperator = null;
    return this;
  }
}

/**
 * Factory function to create a Stripe Search API query builder
 * @returns SearchQueryBuilder instance
 */
export function stripeQuery(): SearchQueryBuilder {
  return new SearchQueryBuilder();
}
