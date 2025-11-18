# stripe-search-ql

Stripe Search APIのクエリを簡単に構築するためのTypeScriptクエリビルダーライブラリです。

## インストール

```bash
npm install stripe-search-ql
```

## 使用方法

### 基本的な使用例

```typescript
import { stripeQuery } from "stripe-search-ql";

// 完全一致検索
const query = stripeQuery()
  .field("email")
  .equals("amy@rocketrides.io")
  .build();
// => 'email:"amy@rocketrides.io"'

// 数値比較
const amountQuery = stripeQuery()
  .field("amount")
  .greaterThan(1000)
  .build();
// => 'amount>1000'

// 部分文字列マッチ
const substringQuery = stripeQuery()
  .field("email")
  .contains("amy")
  .build();
// => 'email~"amy"'
```

### 複数条件の結合

```typescript
// AND演算子
const andQuery = stripeQuery()
  .field("email")
  .equals("amy@rocketrides.io")
  .and()
  .field("currency")
  .equals("usd")
  .build();
// => 'email:"amy@rocketrides.io" AND currency:"usd"'

// OR演算子
const orQuery = stripeQuery()
  .field("currency")
  .equals("usd")
  .or()
  .field("currency")
  .equals("eur")
  .build();
// => 'currency:"usd" OR currency:"eur"'
```

### メタデータ検索

```typescript
// メタデータの完全一致
const metadataQuery = stripeQuery()
  .metadata("donation-id")
  .equals("asdf-jkl")
  .build();
// => 'metadata["donation-id"]:"asdf-jkl"'

// メタデータの部分文字列マッチ
const metadataSubstringQuery = stripeQuery()
  .metadata("key")
  .contains("value")
  .build();
// => 'metadata["key"]~"value"'
```

### 否定検索

```typescript
// フィールドの否定
const negatedQuery = stripeQuery()
  .not("currency")
  .equals("jpy")
  .build();
// => '-currency:"jpy"'

// メタデータの否定
const negatedMetadataQuery = stripeQuery()
  .notMetadata("donation-id")
  .equals("asdf-jkl")
  .build();
// => '-metadata["donation-id"]:"asdf-jkl"'
```

### NULL値チェック

```typescript
// フィールドがNULLかチェック
const nullCheckQuery = stripeQuery()
  .field("url")
  .isNull()
  .build();
// => 'url:null'

// メタデータキーが存在しないかチェック
const metadataNullQuery = stripeQuery()
  .notMetadata("donation-id")
  .isNull()
  .build();
// => '-metadata["donation-id"]:null'
```

### 数値比較演算子

```typescript
// より大きい
stripeQuery().field("amount").greaterThan(1000).build();
// => 'amount>1000'

// より小さい
stripeQuery().field("amount").lessThan(1000).build();
// => 'amount<1000'

// 以上
stripeQuery().field("amount").greaterThanOrEqual(1000).build();
// => 'amount>=1000'

// 以下
stripeQuery().field("amount").lessThanOrEqual(1000).build();
// => 'amount<=1000'
```

### 複雑なクエリの例

```typescript
// 複数の条件を組み合わせる
const complexQuery = stripeQuery()
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

## APIリファレンス

### `stripeQuery()`

新しいクエリビルダーインスタンスを作成します。

**戻り値**: `SearchQueryBuilder`インスタンス

### `SearchQueryBuilder`

#### フィールド検索

- `field(field: string): FieldBuilder` - フィールドを指定して検索条件を構築
- `not(field: string): FieldBuilder` - 否定のフィールドを指定して検索条件を構築

#### メタデータ検索

- `metadata(key: string): MetadataFieldBuilder` - メタデータフィールドを指定して検索条件を構築
- `notMetadata(key: string): MetadataFieldBuilder` - 否定のメタデータフィールドを指定して検索条件を構築

#### 論理演算子

- `and(): SearchQueryBuilder` - AND演算子を追加
- `or(): SearchQueryBuilder` - OR演算子を追加

#### その他

- `build(): string` - 構築したクエリを文字列として返す
- `reset(): SearchQueryBuilder` - クエリをリセット

### `FieldBuilder`

- `equals(value: string | number | null): SearchQueryBuilder` - 完全一致 (`:`)
- `contains(value: string): SearchQueryBuilder` - 部分文字列マッチ (`~`, 最小3文字)
- `greaterThan(value: number): SearchQueryBuilder` - より大きい (`>`)
- `lessThan(value: number): SearchQueryBuilder` - より小さい (`<`)
- `greaterThanOrEqual(value: number): SearchQueryBuilder` - 以上 (`>=`)
- `lessThanOrEqual(value: number): SearchQueryBuilder` - 以下 (`<=`)
- `isNull(): SearchQueryBuilder` - NULL値チェック

### `MetadataFieldBuilder`

- `equals(value: string | number | null): SearchQueryBuilder` - 完全一致 (`:`)
- `contains(value: string): SearchQueryBuilder` - 部分文字列マッチ (`~`, 最小3文字)
- `isNull(): SearchQueryBuilder` - NULL値チェック（メタデータキーが存在しない場合）

## Stripe Search APIとの統合

構築したクエリは、Stripe SDKやAPIクライアントで使用できます。

```typescript
import { stripeQuery } from "stripe-search-ql";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// クエリを構築
const query = stripeQuery()
  .field("email")
  .equals("customer@example.com")
  .build();

// Stripe APIで検索
const customers = await stripe.customers.search({
  query: query,
});
```

## 制限事項

- 部分文字列マッチ (`~`) は最小3文字が必要です
- 同じクエリ内で `AND` と `OR` を混在させることはできません（Stripe Search APIの制限）
- 括弧による優先順位の指定はサポートされていません（Stripe Search APIの制限）

## 開発

```bash
# 依存関係のインストール
npm install

# ビルド
npm run build

# テスト
npm test

# テスト（ウォッチモード）
npm run test:watch

# リンター
npm run lint

# フォーマッター
npm run format

# 型チェック
npm run typecheck
```

## ライセンス

MIT

