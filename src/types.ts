/**
 * 論理演算子
 */
export type LogicalOperator = "AND" | "OR";

/**
 * クエリ句の種類
 */
export type ClauseType = "field" | "logical";

/**
 * 数値演算子
 */
export type NumericOperator = ">" | "<" | ">=" | "<=";

/**
 * 文字列演算子
 */
export type StringOperator = ":" | "~";

/**
 * フィールド句の情報
 */
export interface FieldClause {
  type: "field";
  field: string;
  operator: NumericOperator | StringOperator;
  value: string | number | null;
  negated: boolean;
}

/**
 * 論理演算子句の情報
 */
export interface LogicalClause {
  type: "logical";
  operator: LogicalOperator;
}

/**
 * クエリ句
 */
export type QueryClause = FieldClause | LogicalClause;
