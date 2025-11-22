import { describe, expect, it } from "vitest";
import { stripeQuery } from "./query-builder.js";

describe("SearchQueryBuilder", () => {
  describe("Basic field search", () => {
    it("should build an exact match query", () => {
      const query = stripeQuery().field("email").equals("amy@rocketrides.io").build();

      expect(query).toBe('email:"amy@rocketrides.io"');
    });

    it("should build an exact match query for numeric fields", () => {
      const query = stripeQuery().field("amount").equals(1000).build();

      expect(query).toBe("amount:1000");
    });

    it("should build a substring match query", () => {
      const query = stripeQuery().field("email").contains("amy").build();

      expect(query).toBe('email~"amy"');
    });

    it("should throw an error for substring match with less than 3 characters", () => {
      expect(() => {
        stripeQuery().field("email").contains("am").build();
      }).toThrow("Substring match requires at least 3 characters");
    });
  });

  describe("Numeric comparison", () => {
    it("should build a greater than operator", () => {
      const query = stripeQuery().field("amount").greaterThan(1000).build();

      expect(query).toBe("amount>1000");
    });

    it("should build a less than operator", () => {
      const query = stripeQuery().field("amount").lessThan(1000).build();

      expect(query).toBe("amount<1000");
    });

    it("should build a greater than or equal operator", () => {
      const query = stripeQuery().field("amount").greaterThanOrEqual(1000).build();

      expect(query).toBe("amount>=1000");
    });

    it("should build a less than or equal operator", () => {
      const query = stripeQuery().field("amount").lessThanOrEqual(1000).build();

      expect(query).toBe("amount<=1000");
    });

    it("should build a between query for range", () => {
      const query = stripeQuery().field("amount").between(1000, 5000).build();

      expect(query).toBe("amount>=1000 AND amount<=5000");
    });

    it("should build a between query with negative values", () => {
      const query = stripeQuery().field("balance").between(-1000, 0).build();

      expect(query).toBe("balance>=-1000 AND balance<=0");
    });

    it("should build a between query combined with other conditions", () => {
      const query = stripeQuery()
        .field("currency")
        .equals("usd")
        .and()
        .field("amount")
        .between(1000, 5000)
        .build();

      expect(query).toBe('currency:"usd" AND amount>=1000 AND amount<=5000');
    });
  });

  describe("Negation", () => {
    it("should build a negated field query", () => {
      const query = stripeQuery().not("currency").equals("jpy").build();

      expect(query).toBe('-currency:"jpy"');
    });
  });

  describe("Logical operators", () => {
    it("should combine multiple conditions with AND operator", () => {
      const query = stripeQuery()
        .field("email")
        .equals("amy@rocketrides.io")
        .and()
        .metadata("donation-id")
        .equals("asdf-jkl")
        .build();

      expect(query).toBe('email:"amy@rocketrides.io" AND metadata["donation-id"]:"asdf-jkl"');
    });

    it("should combine multiple conditions with OR operator", () => {
      const query = stripeQuery()
        .field("currency")
        .equals("usd")
        .or()
        .field("currency")
        .equals("eur")
        .build();

      expect(query).toBe('currency:"usd" OR currency:"eur"');
    });

    it("should combine multiple AND conditions", () => {
      const query = stripeQuery()
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

    it("should combine multiple OR conditions", () => {
      const query = stripeQuery()
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

    it("should use only one of consecutive logical operators", () => {
      const query = stripeQuery().field("a").equals(1).and().and().field("b").equals(2).build();

      expect(query).toBe("a:1 AND b:2");
    });

    it("should ignore trailing logical operators", () => {
      const query = stripeQuery().field("a").equals(1).and().field("b").equals(2).and().build();

      expect(query).toBe("a:1 AND b:2");
    });
  });

  describe("Metadata search", () => {
    it("should build an exact match query for metadata", () => {
      const query = stripeQuery().metadata("donation-id").equals("asdf-jkl").build();

      expect(query).toBe('metadata["donation-id"]:"asdf-jkl"');
    });

    it("should build a substring match query for metadata", () => {
      const query = stripeQuery().metadata("key").contains("value").build();

      expect(query).toBe('metadata["key"]~"value"');
    });

    it("should build a negated metadata query", () => {
      const query = stripeQuery().notMetadata("donation-id").equals("asdf-jkl").build();

      expect(query).toBe('-metadata["donation-id"]:"asdf-jkl"');
    });
  });

  describe("NULL value check", () => {
    it("should build a NULL value check query", () => {
      const query = stripeQuery().field("url").isNull().build();

      expect(query).toBe("url:null");
    });

    it("should build a metadata key existence check query", () => {
      const query = stripeQuery().notMetadata("donation-id").isNull().build();

      expect(query).toBe('-metadata["donation-id"]:null');
    });
  });

  describe("Complex queries", () => {
    it("should build a query combining multiple conditions", () => {
      const query = stripeQuery()
        .field("email")
        .equals("amy@rocketrides.io")
        .and()
        .metadata("donation-id")
        .equals("asdf-jkl")
        .build();

      expect(query).toBe('email:"amy@rocketrides.io" AND metadata["donation-id"]:"asdf-jkl"');
    });

    it("should build a query combining numeric comparison and string search", () => {
      const query = stripeQuery()
        .field("amount")
        .greaterThan(1000)
        .and()
        .field("currency")
        .equals("usd")
        .build();

      expect(query).toBe('amount>1000 AND currency:"usd"');
    });
  });

  describe("Edge cases", () => {
    it("should return an empty string for an empty query builder", () => {
      const query = stripeQuery().build();
      expect(query).toBe("");
    });

    it("should escape string values containing quotes", () => {
      const query = stripeQuery()
        .field("description")
        .equals('the story called "The Sky and the Sea."')
        .build();

      expect(query).toBe('description:"the story called \\"The Sky and the Sea.\\""');
    });

    it("should escape string values containing backslashes", () => {
      const query = stripeQuery().field("path").equals("C:\\Users\\test").build();

      expect(query).toBe('path:"C:\\\\Users\\\\test"');
    });

    it("should escape metadata keys containing special characters", () => {
      const query = stripeQuery().metadata('key with "quotes"').equals("value").build();

      expect(query).toBe('metadata["key with \\"quotes\\""]:"value"');
    });
  });

  describe("reset", () => {
    it("should reset the query", () => {
      const builder = stripeQuery().field("email").equals("test@example.com");
      builder.reset();
      expect(builder.build()).toBe("");
    });
  });

  describe("Leading logical operator handling", () => {
    it("should ignore AND operator at the beginning", () => {
      const query = stripeQuery().and().field("a").equals(1).build();
      expect(query).toBe("a:1");
    });

    it("should ignore OR operator at the beginning", () => {
      const query = stripeQuery().or().field("a").equals(1).build();
      expect(query).toBe("a:1");
    });

    it("should ignore all AND operators at the beginning", () => {
      const query = stripeQuery().and().and().field("a").equals(1).build();
      expect(query).toBe("a:1");
    });

    it("should ignore all OR operators at the beginning", () => {
      const query = stripeQuery().or().or().field("a").equals(1).build();
      expect(query).toBe("a:1");
    });

    it("should ignore only the leading AND when field clause and AND operator follow", () => {
      const query = stripeQuery().and().field("a").equals(1).and().field("b").equals(2).build();
      expect(query).toBe("a:1 AND b:2");
    });

    it("should ignore only the leading OR when field clause and OR operator follow", () => {
      const query = stripeQuery().or().field("a").equals(1).or().field("b").equals(2).build();
      expect(query).toBe("a:1 OR b:2");
    });

    it("should return an empty string for a query with only logical operators", () => {
      const query = stripeQuery().and().build();
      expect(query).toBe("");
    });

    it("should return an empty string for a query with only multiple AND operators", () => {
      const query = stripeQuery().and().and().build();
      expect(query).toBe("");
    });

    it("should return an empty string for a query with only multiple OR operators", () => {
      const query = stripeQuery().or().or().build();
      expect(query).toBe("");
    });

    it("should throw an error when mixing AND and OR in a query with only logical operators", () => {
      expect(() => {
        stripeQuery().and().or().build();
      }).toThrow("Cannot mix AND and OR operators in a single query");
    });
  });

  describe("Preventing AND and OR mixing", () => {
    it("should throw an error when adding OR after adding AND following a field clause", () => {
      expect(() => {
        stripeQuery().field("a").equals(1).and().field("b").equals(2).or().field("c").equals(3);
      }).toThrow("Cannot mix AND and OR operators in a single query");
    });

    it("should throw an error when adding AND after adding OR following a field clause", () => {
      expect(() => {
        stripeQuery().field("a").equals(1).or().field("b").equals(2).and().field("c").equals(3);
      }).toThrow("Cannot mix AND and OR operators in a single query");
    });

    it("should throw an error when adding field clause and OR after adding AND at the beginning", () => {
      expect(() => {
        stripeQuery().and().field("a").equals(1).or().field("b").equals(2);
      }).toThrow("Cannot mix AND and OR operators in a single query");
    });

    it("should throw an error when adding field clause and AND after adding OR at the beginning", () => {
      expect(() => {
        stripeQuery().or().field("a").equals(1).and().field("b").equals(2);
      }).toThrow("Cannot mix AND and OR operators in a single query");
    });

    it("should throw an error when adding OR after multiple AND operators", () => {
      expect(() => {
        stripeQuery()
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

    it("should throw an error when adding AND after multiple OR operators", () => {
      expect(() => {
        stripeQuery()
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

    it("should be able to use different logical operators after reset", () => {
      const builder = stripeQuery().field("a").equals(1).and().field("b").equals(2);
      builder.reset();
      const query = builder.field("a").equals(1).or().field("b").equals(2).build();
      expect(query).toBe("a:1 OR b:2");
    });

    it("should reset the logical operator state after reset", () => {
      const builder = stripeQuery().field("a").equals(1).and().field("b").equals(2);
      builder.reset();
      // After reset, AND can also be used
      const query = builder.field("a").equals(1).and().field("b").equals(2).build();
      expect(query).toBe("a:1 AND b:2");
    });
  });
});
