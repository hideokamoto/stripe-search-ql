/**
 * Stripe Search APIのフィールドタイプ
 */
export type FieldType = "string" | "numeric" | "token";

/**
 * 数値比較演算子
 */
export type NumericOperator = ">" | "<" | ">=" | "<=" | "=";

/**
 * 文字列演算子
 */
export type StringOperator = ":" | "~";

/**
 * 論理演算子
 */
export type LogicalOperator = "AND" | "OR";

/**
 * Stripe Search APIでサポートされているリソースタイプ
 */
export type ResourceType =
  | "Customer"
  | "Charge"
  | "PaymentIntent"
  | "Invoice"
  | "Subscription"
  | "Product"
  | "Price";

/**
 * クエリ句の種類
 */
export type ClauseType = "field" | "logical";

/**
 * フィールド句の情報
 */
export interface FieldClause {
  type: "field";
  field: string;
  operator: string;
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
