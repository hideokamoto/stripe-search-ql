import type { LogicalOperator, NumericOperator, QueryClause } from "./types.js";
import { escapeMetadataKey, formatValue } from "./utils.js";

/**
 * フィールド句を構築するためのビルダー
 */
class FieldBuilder {
  private field: string;
  private negated: boolean;
  private queryBuilder: QueryBuilder;

  constructor(field: string, negated: boolean, queryBuilder: QueryBuilder) {
    this.field = field;
    this.negated = negated;
    this.queryBuilder = queryBuilder;
  }

  /**
   * 完全一致演算子 (`:`)
   * @param value 検索値
   * @returns QueryBuilderインスタンス
   */
  equals(value: string | number | null): QueryBuilder {
    return this.addClause(":", value);
  }

  /**
   * 部分文字列マッチ演算子 (`~`)
   * @param value 検索値（最小3文字）
   * @returns QueryBuilderインスタンス
   */
  contains(value: string): QueryBuilder {
    if (value.length < 3) {
      throw new Error("Substring match requires at least 3 characters");
    }
    return this.addClause("~", value);
  }

  /**
   * より大きい演算子 (`>`)
   * @param value 比較値
   * @returns QueryBuilderインスタンス
   */
  greaterThan(value: number): QueryBuilder {
    return this.addClause(">", value);
  }

  /**
   * より小さい演算子 (`<`)
   * @param value 比較値
   * @returns QueryBuilderインスタンス
   */
  lessThan(value: number): QueryBuilder {
    return this.addClause("<", value);
  }

  /**
   * 以上演算子 (`>=`)
   * @param value 比較値
   * @returns QueryBuilderインスタンス
   */
  greaterThanOrEqual(value: number): QueryBuilder {
    return this.addClause(">=", value);
  }

  /**
   * 以下演算子 (`<=`)
   * @param value 比較値
   * @returns QueryBuilderインスタンス
   */
  lessThanOrEqual(value: number): QueryBuilder {
    return this.addClause("<=", value);
  }

  /**
   * NULL値チェック（フィールドが存在しない、または空の場合）
   * @returns QueryBuilderインスタンス
   */
  isNull(): QueryBuilder {
    return this.addClause(":", null);
  }

  /**
   * 否定のフィールド句を追加
   * @param operator 演算子
   * @param value 値
   * @returns QueryBuilderインスタンス
   */
  private addClause(operator: string, value: string | number | null): QueryBuilder {
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
 * メタデータフィールドビルダー
 */
class MetadataFieldBuilder {
  private key: string;
  private negated: boolean;
  private queryBuilder: QueryBuilder;

  constructor(key: string, negated: boolean, queryBuilder: QueryBuilder) {
    this.key = key;
    this.negated = negated;
    this.queryBuilder = queryBuilder;
  }

  /**
   * 完全一致演算子 (`:`)
   * @param value 検索値
   * @returns QueryBuilderインスタンス
   */
  equals(value: string | number | null): QueryBuilder {
    const field = `metadata[${escapeMetadataKey(this.key)}]`;
    return this.queryBuilder.addFieldClause({
      type: "field",
      field,
      operator: ":",
      value,
      negated: this.negated,
    });
  }

  /**
   * 部分文字列マッチ演算子 (`~`)
   * @param value 検索値（最小3文字）
   * @returns QueryBuilderインスタンス
   */
  contains(value: string): QueryBuilder {
    if (value.length < 3) {
      throw new Error("Substring match requires at least 3 characters");
    }
    const field = `metadata[${escapeMetadataKey(this.key)}]`;
    return this.queryBuilder.addFieldClause({
      type: "field",
      field,
      operator: "~",
      value,
      negated: this.negated,
    });
  }

  /**
   * NULL値チェック（メタデータキーが存在しない場合）
   * @returns QueryBuilderインスタンス
   */
  isNull(): QueryBuilder {
    const field = `metadata[${escapeMetadataKey(this.key)}]`;
    return this.queryBuilder.addFieldClause({
      type: "field",
      field,
      operator: ":",
      value: null,
      negated: this.negated,
    });
  }
}

/**
 * Stripe Search APIのクエリを構築するビルダークラス
 */
export class QueryBuilder {
  private clauses: QueryClause[] = [];

  /**
   * フィールド句を追加
   * @param clause フィールド句
   * @returns QueryBuilderインスタンス
   */
  addFieldClause(clause: QueryClause): QueryBuilder {
    this.clauses.push(clause);
    return this;
  }

  /**
   * フィールドを指定して検索条件を構築
   * @param field フィールド名
   * @returns FieldBuilderインスタンス
   */
  field(field: string): FieldBuilder {
    return new FieldBuilder(field, false, this);
  }

  /**
   * 否定のフィールドを指定して検索条件を構築
   * @param field フィールド名
   * @returns FieldBuilderインスタンス
   */
  not(field: string): FieldBuilder {
    return new FieldBuilder(field, true, this);
  }

  /**
   * メタデータフィールドを指定して検索条件を構築
   * @param key メタデータキー
   * @returns MetadataFieldBuilderインスタンス
   */
  metadata(key: string): MetadataFieldBuilder {
    return new MetadataFieldBuilder(key, false, this);
  }

  /**
   * 否定のメタデータフィールドを指定して検索条件を構築
   * @param key メタデータキー
   * @returns MetadataFieldBuilderインスタンス
   */
  notMetadata(key: string): MetadataFieldBuilder {
    return new MetadataFieldBuilder(key, true, this);
  }

  /**
   * AND演算子を追加
   * @returns QueryBuilderインスタンス
   */
  and(): QueryBuilder {
    this.clauses.push({
      type: "logical",
      operator: "AND",
    });
    return this;
  }

  /**
   * OR演算子を追加
   * @returns QueryBuilderインスタンス
   */
  or(): QueryBuilder {
    this.clauses.push({
      type: "logical",
      operator: "OR",
    });
    return this;
  }

  /**
   * 構築したクエリを文字列として返す
   * @returns クエリ文字列
   */
  build(): string {
    if (this.clauses.length === 0) {
      return "";
    }

    const parts: string[] = [];
    let lastWasLogical = false;

    for (const clause of this.clauses) {
      if (clause.type === "field") {
        const prefix = clause.negated ? "-" : "";
        const value = formatValue(clause.value);
        parts.push(`${prefix}${clause.field}${clause.operator}${value}`);
        lastWasLogical = false;
      } else if (clause.type === "logical") {
        // 連続する論理演算子を防ぐ
        if (!lastWasLogical) {
          parts.push(clause.operator);
          lastWasLogical = true;
        }
      }
    }

    // 末尾の論理演算子を削除
    if (lastWasLogical) {
      parts.pop();
    }

    return parts.join(" ");
  }

  /**
   * クエリをリセット
   * @returns QueryBuilderインスタンス
   */
  reset(): QueryBuilder {
    this.clauses = [];
    return this;
  }
}

/**
 * Stripe Search APIのクエリビルダーを作成するファクトリー関数
 * @returns QueryBuilderインスタンス
 */
export function stripeSearch(): QueryBuilder {
  return new QueryBuilder();
}
