/**
 * Logical operator
 */
export type LogicalOperator = "AND" | "OR";

/**
 * Query clause type
 */
export type ClauseType = "field" | "logical";

/**
 * Numeric operator
 */
export type NumericOperator = ">" | "<" | ">=" | "<=";

/**
 * String operator
 */
export type StringOperator = ":" | "~";

/**
 * Field clause information
 */
export interface FieldClause {
  type: "field";
  field: string;
  operator: NumericOperator | StringOperator;
  value: string | number | null;
  negated: boolean;
}

/**
 * Logical operator clause information
 */
export interface LogicalClause {
  type: "logical";
  operator: LogicalOperator;
}

/**
 * Query clause
 */
export type QueryClause = FieldClause | LogicalClause;
