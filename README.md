# stripe-search-ql

Stripe Search APIのクエリを簡単に構築するためのTypeScriptクエリビルダーライブラリです。

## インストール

```bash
npm install stripe-search-ql
```

## 使用方法

### 基本的な使用例

```typescript
import { stripeSearch } from "stripe-search-ql";

// 完全一致検索
const query = stripeSearch()
  .field("email")
  .equals("amy@rocketrides.io")
  .build();
// => 'email:"amy@rocketrides.io"'

// 数値比較
const amountQuery = stripeSearch()
  .field("amount")
  .greaterThan(1000)
  .build();
// => 'amount>1000'

// 部分文字列マッチ
const substringQuery = stripeSearch()
  .field("email")
  .contains("amy")
  .build();
// => 'email~"amy"'
```

### 複数条件の結合

```typescript
// AND演算子
const andQuery = stripeSearch()
  .field("email")
  .equals("amy@rocketrides.io")
  .and()
  .field("currency")
  .equals("usd")
  .build();
// => 'email:"amy@rocketrides.io" AND currency:"usd"'

// OR演算子
const orQuery = stripeSearch()
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
const metadataQuery = stripeSearch()
  .metadata("donation-id")
  .equals("asdf-jkl")
  .build();
// => 'metadata["donation-id"]:"asdf-jkl"'

// メタデータの部分文字列マッチ
const metadataSubstringQuery = stripeSearch()
  .metadata("key")
  .contains("value")
  .build();
// => 'metadata["key"]~"value"'
```

### 否定検索

```typescript
// フィールドの否定
const negatedQuery = stripeSearch()
  .not("currency")
  .equals("jpy")
  .build();
// => '-currency:"jpy"'

// メタデータの否定
const negatedMetadataQuery = stripeSearch()
  .notMetadata("donation-id")
  .equals("asdf-jkl")
  .build();
// => '-metadata["donation-id"]:"asdf-jkl"'
```

### NULL値チェック

```typescript
// フィールドがNULLかチェック
const nullCheckQuery = stripeSearch()
  .field("url")
  .isNull()
  .build();
// => 'url:null'

// メタデータキーが存在しないかチェック
const metadataNullQuery = stripeSearch()
  .notMetadata("donation-id")
  .isNull()
  .build();
// => '-metadata["donation-id"]:null'
```

### 数値比較演算子

```typescript
// より大きい
stripeSearch().field("amount").greaterThan(1000).build();
// => 'amount>1000'

// より小さい
stripeSearch().field("amount").lessThan(1000).build();
// => 'amount<1000'

// 以上
stripeSearch().field("amount").greaterThanOrEqual(1000).build();
// => 'amount>=1000'

// 以下
stripeSearch().field("amount").lessThanOrEqual(1000).build();
// => 'amount<=1000'
```

### 複雑なクエリの例

```typescript
// 複数の条件を組み合わせる
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

## APIリファレンス

### `stripeSearch()`

新しいクエリビルダーインスタンスを作成します。

**戻り値**: `QueryBuilder`インスタンス

### `QueryBuilder`

#### フィールド検索

- `field(field: string): FieldBuilder` - フィールドを指定して検索条件を構築
- `not(field: string): FieldBuilder` - 否定のフィールドを指定して検索条件を構築

#### メタデータ検索

- `metadata(key: string): MetadataFieldBuilder` - メタデータフィールドを指定して検索条件を構築
- `notMetadata(key: string): MetadataFieldBuilder` - 否定のメタデータフィールドを指定して検索条件を構築

#### 論理演算子

- `and(): QueryBuilder` - AND演算子を追加
- `or(): QueryBuilder` - OR演算子を追加

#### その他

- `build(): string` - 構築したクエリを文字列として返す
- `reset(): QueryBuilder` - クエリをリセット

### `FieldBuilder`

- `equals(value: string | number | null): QueryBuilder` - 完全一致 (`:`)
- `contains(value: string): QueryBuilder` - 部分文字列マッチ (`~`, 最小3文字)
- `greaterThan(value: number): QueryBuilder` - より大きい (`>`)
- `lessThan(value: number): QueryBuilder` - より小さい (`<`)
- `greaterThanOrEqual(value: number): QueryBuilder` - 以上 (`>=`)
- `lessThanOrEqual(value: number): QueryBuilder` - 以下 (`<=`)
- `isNull(): QueryBuilder` - NULL値チェック

### `MetadataFieldBuilder`

- `equals(value: string | number | null): QueryBuilder` - 完全一致 (`:`)
- `contains(value: string): QueryBuilder` - 部分文字列マッチ (`~`, 最小3文字)
- `isNull(): QueryBuilder` - NULL値チェック（メタデータキーが存在しない場合）

## Stripe Search APIとの統合

構築したクエリは、Stripe SDKやAPIクライアントで使用できます。

```typescript
import { stripeSearch } from "stripe-search-ql";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// クエリを構築
const query = stripeSearch()
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

