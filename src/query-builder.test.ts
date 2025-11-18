import { describe, expect, it } from "vitest";
import { stripeSearch } from "./query-builder.js";

describe("QueryBuilder", () => {
  describe("基本的なフィールド検索", () => {
    it("完全一致クエリを構築できる", () => {
      const query = stripeSearch().field("email").equals("amy@rocketrides.io").build();

      expect(query).toBe('email:"amy@rocketrides.io"');
    });

    it("数値フィールドの完全一致クエリを構築できる", () => {
      const query = stripeSearch().field("amount").equals(1000).build();

      expect(query).toBe("amount:1000");
    });

    it("部分文字列マッチクエリを構築できる", () => {
      const query = stripeSearch().field("email").contains("amy").build();

      expect(query).toBe('email~"amy"');
    });

    it("部分文字列マッチは3文字未満でエラーになる", () => {
      expect(() => {
        stripeSearch().field("email").contains("am").build();
      }).toThrow("Substring match requires at least 3 characters");
    });
  });

  describe("数値比較", () => {
    it("より大きい演算子を構築できる", () => {
      const query = stripeSearch().field("amount").greaterThan(1000).build();

      expect(query).toBe("amount>1000");
    });

    it("より小さい演算子を構築できる", () => {
      const query = stripeSearch().field("amount").lessThan(1000).build();

      expect(query).toBe("amount<1000");
    });

    it("以上演算子を構築できる", () => {
      const query = stripeSearch().field("amount").greaterThanOrEqual(1000).build();

      expect(query).toBe("amount>=1000");
    });

    it("以下演算子を構築できる", () => {
      const query = stripeSearch().field("amount").lessThanOrEqual(1000).build();

      expect(query).toBe("amount<=1000");
    });
  });

  describe("否定", () => {
    it("否定フィールドクエリを構築できる", () => {
      const query = stripeSearch().not("currency").equals("jpy").build();

      expect(query).toBe('-currency:"jpy"');
    });
  });

  describe("論理演算子", () => {
    it("AND演算子で複数の条件を結合できる", () => {
      const query = stripeSearch()
        .field("email")
        .equals("amy@rocketrides.io")
        .and()
        .metadata("donation-id")
        .equals("asdf-jkl")
        .build();

      expect(query).toBe('email:"amy@rocketrides.io" AND metadata["donation-id"]:"asdf-jkl"');
    });

    it("OR演算子で複数の条件を結合できる", () => {
      const query = stripeSearch()
        .field("currency")
        .equals("usd")
        .or()
        .field("currency")
        .equals("eur")
        .build();

      expect(query).toBe('currency:"usd" OR currency:"eur"');
    });

    it("複数のAND条件を結合できる", () => {
      const query = stripeSearch()
        .field("status")
        .equals("active")
        .and()
        .field("amount")
        .equals(500)
        .and()
        .field("currency")
        .equals("usd")
        .build();

      expect(query).toBe('status:"active" AND amount:500 AND currency:"usd"');
    });

    it("複数のOR条件を結合できる", () => {
      const query = stripeSearch()
        .field("status")
        .equals("pending")
        .or()
        .field("status")
        .equals("failed")
        .or()
        .field("status")
        .equals("canceled")
        .build();

      expect(query).toBe('status:"pending" OR status:"failed" OR status:"canceled"');
    });

    it("連続する論理演算子は1つだけ使用される", () => {
      const query = stripeSearch().field("a").equals(1).and().and().field("b").equals(2).build();

      expect(query).toBe("a:1 AND b:2");
    });

    it("末尾の論理演算子は無視される", () => {
      const query = stripeSearch().field("a").equals(1).and().field("b").equals(2).and().build();

      expect(query).toBe("a:1 AND b:2");
    });
  });

  describe("メタデータ検索", () => {
    it("メタデータの完全一致クエリを構築できる", () => {
      const query = stripeSearch().metadata("donation-id").equals("asdf-jkl").build();

      expect(query).toBe('metadata["donation-id"]:"asdf-jkl"');
    });

    it("メタデータの部分文字列マッチクエリを構築できる", () => {
      const query = stripeSearch().metadata("key").contains("value").build();

      expect(query).toBe('metadata["key"]~"value"');
    });

    it("否定のメタデータクエリを構築できる", () => {
      const query = stripeSearch().notMetadata("donation-id").equals("asdf-jkl").build();

      expect(query).toBe('-metadata["donation-id"]:"asdf-jkl"');
    });
  });

  describe("NULL値チェック", () => {
    it("NULL値チェッククエリを構築できる", () => {
      const query = stripeSearch().field("url").isNull().build();

      expect(query).toBe("url:null");
    });

    it("メタデータキーの存在チェッククエリを構築できる", () => {
      const query = stripeSearch().notMetadata("donation-id").isNull().build();

      expect(query).toBe('-metadata["donation-id"]:null');
    });
  });

  describe("複雑なクエリ", () => {
    it("複数の条件を組み合わせたクエリを構築できる", () => {
      const query = stripeSearch()
        .field("email")
        .equals("amy@rocketrides.io")
        .and()
        .metadata("donation-id")
        .equals("asdf-jkl")
        .build();

      expect(query).toBe('email:"amy@rocketrides.io" AND metadata["donation-id"]:"asdf-jkl"');
    });

    it("数値比較と文字列検索を組み合わせたクエリを構築できる", () => {
      const query = stripeSearch()
        .field("amount")
        .greaterThan(1000)
        .and()
        .field("currency")
        .equals("usd")
        .build();

      expect(query).toBe('amount>1000 AND currency:"usd"');
    });
  });

  describe("エッジケース", () => {
    it("空のクエリビルダーは空文字列を返す", () => {
      const query = stripeSearch().build();
      expect(query).toBe("");
    });

    it("引用符を含む文字列値をエスケープできる", () => {
      const query = stripeSearch()
        .field("description")
        .equals('the story called "The Sky and the Sea."')
        .build();

      expect(query).toBe('description:"the story called \\"The Sky and the Sea.\\""');
    });

    it("バックスラッシュを含む文字列値をエスケープできる", () => {
      const query = stripeSearch().field("path").equals("C:\\Users\\test").build();

      expect(query).toBe('path:"C:\\\\Users\\\\test"');
    });

    it("メタデータキーに特殊文字を含む場合にエスケープできる", () => {
      const query = stripeSearch().metadata('key with "quotes"').equals("value").build();

      expect(query).toBe('metadata["key with \\"quotes\\""]:"value"');
    });
  });

  describe("reset", () => {
    it("クエリをリセットできる", () => {
      const builder = stripeSearch().field("email").equals("test@example.com");
      builder.reset();
      expect(builder.build()).toBe("");
    });
  });

  describe("論理演算子の先頭処理", () => {
    it("AND演算子が先頭に来る場合は無視される", () => {
      const query = stripeSearch().and().field("a").equals(1).build();
      expect(query).toBe("a:1");
    });

    it("OR演算子が先頭に来る場合は無視される", () => {
      const query = stripeSearch().or().field("a").equals(1).build();
      expect(query).toBe("a:1");
    });

    it("複数のAND演算子が先頭に来る場合は全て無視される", () => {
      const query = stripeSearch().and().and().field("a").equals(1).build();
      expect(query).toBe("a:1");
    });

    it("複数のOR演算子が先頭に来る場合は全て無視される", () => {
      const query = stripeSearch().or().or().field("a").equals(1).build();
      expect(query).toBe("a:1");
    });

    it("先頭のAND演算子の後にフィールド句とAND演算子が続く場合、先頭のANDのみ無視される", () => {
      const query = stripeSearch().and().field("a").equals(1).and().field("b").equals(2).build();
      expect(query).toBe("a:1 AND b:2");
    });

    it("先頭のOR演算子の後にフィールド句とOR演算子が続く場合、先頭のORのみ無視される", () => {
      const query = stripeSearch().or().field("a").equals(1).or().field("b").equals(2).build();
      expect(query).toBe("a:1 OR b:2");
    });

    it("論理演算子のみのクエリは空文字列を返す", () => {
      const query = stripeSearch().and().build();
      expect(query).toBe("");
    });

    it("複数のAND演算子のみのクエリは空文字列を返す", () => {
      const query = stripeSearch().and().and().build();
      expect(query).toBe("");
    });

    it("複数のOR演算子のみのクエリは空文字列を返す", () => {
      const query = stripeSearch().or().or().build();
      expect(query).toBe("");
    });

    it("論理演算子のみのクエリでもANDとORの混在はエラーになる", () => {
      expect(() => {
        stripeSearch().and().or().build();
      }).toThrow("Cannot mix AND and OR operators in a single query");
    });
  });

  describe("ANDとORの混在防止", () => {
    it("フィールド句の後にANDを追加し、その後にORを追加しようとするとエラーになる", () => {
      expect(() => {
        stripeSearch().field("a").equals(1).and().field("b").equals(2).or().field("c").equals(3);
      }).toThrow("Cannot mix AND and OR operators in a single query");
    });

    it("フィールド句の後にORを追加し、その後にANDを追加しようとするとエラーになる", () => {
      expect(() => {
        stripeSearch().field("a").equals(1).or().field("b").equals(2).and().field("c").equals(3);
      }).toThrow("Cannot mix AND and OR operators in a single query");
    });

    it("先頭にANDを追加し、その後にフィールド句とORを追加しようとするとエラーになる", () => {
      expect(() => {
        stripeSearch().and().field("a").equals(1).or().field("b").equals(2);
      }).toThrow("Cannot mix AND and OR operators in a single query");
    });

    it("先頭にORを追加し、その後にフィールド句とANDを追加しようとするとエラーになる", () => {
      expect(() => {
        stripeSearch().or().field("a").equals(1).and().field("b").equals(2);
      }).toThrow("Cannot mix AND and OR operators in a single query");
    });

    it("複数のANDの後にORを追加しようとするとエラーになる", () => {
      expect(() => {
        stripeSearch()
          .field("a")
          .equals(1)
          .and()
          .field("b")
          .equals(2)
          .and()
          .field("c")
          .equals(3)
          .or()
          .field("d")
          .equals(4);
      }).toThrow("Cannot mix AND and OR operators in a single query");
    });

    it("複数のORの後にANDを追加しようとするとエラーになる", () => {
      expect(() => {
        stripeSearch()
          .field("a")
          .equals(1)
          .or()
          .field("b")
          .equals(2)
          .or()
          .field("c")
          .equals(3)
          .and()
          .field("d")
          .equals(4);
      }).toThrow("Cannot mix AND and OR operators in a single query");
    });

    it("reset後に異なる論理演算子を使用できる", () => {
      const builder = stripeSearch().field("a").equals(1).and().field("b").equals(2);
      builder.reset();
      const query = builder.field("a").equals(1).or().field("b").equals(2).build();
      expect(query).toBe("a:1 OR b:2");
    });

    it("reset後、論理演算子の状態がリセットされる", () => {
      const builder = stripeSearch().field("a").equals(1).and().field("b").equals(2);
      builder.reset();
      // reset後はANDも使用できる
      const query = builder.field("a").equals(1).and().field("b").equals(2).build();
      expect(query).toBe("a:1 AND b:2");
    });
  });
});
