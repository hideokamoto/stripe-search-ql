import { describe, expect, it } from "vitest";
import { customerQuery } from "./customer-query.js";

describe("CustomerQueryBuilder", () => {
  it("should build a query with email field", () => {
    const query = customerQuery().email().equals("test@example.com").build();

    expect(query).toBe('email:"test@example.com"');
  });

  it("should build a query with name field", () => {
    const query = customerQuery().name().contains("John").build();

    expect(query).toBe('name~"John"');
  });

  it("should build a query with created field using numeric comparison", () => {
    const query = customerQuery().created().greaterThan(1704067200).build();

    expect(query).toBe("created>1704067200");
  });

  it("should build a query combining multiple customer fields", () => {
    const query = customerQuery()
      .email()
      .equals("test@example.com")
      .and()
      .name()
      .contains("John")
      .build();

    expect(query).toBe('email:"test@example.com" AND name~"John"');
  });

  it("should support metadata on customer queries", () => {
    const query = customerQuery().metadata("plan").equals("premium").build();

    expect(query).toBe('metadata["plan"]:"premium"');
  });

  it("should support negation on customer fields", () => {
    const query = customerQuery().email().not().equals("blocked@example.com").build();

    expect(query).toBe('-email:"blocked@example.com"');
  });

  it("should support negation on metadata fields", () => {
    const query = customerQuery().metadata("vip").not().equals("true").build();

    expect(query).toBe('-metadata["vip"]:"true"');
  });

  it("should toggle negation back to positive when not() is called twice on a customer field", () => {
    const query = customerQuery().email().not().not().equals("a@example.com").build();

    expect(query).toBe('email:"a@example.com"');
  });

  it("should toggle negation back to positive when not() is called twice on a metadata field", () => {
    const query = customerQuery().metadata("vip").not().not().equals("true").build();

    expect(query).toBe('metadata["vip"]:"true"');
  });

  it("should build a complex customer query", () => {
    const query = customerQuery()
      .created()
      .greaterThan(1704067200)
      .and()
      .email()
      .contains("@example.com")
      .and()
      .metadata("plan")
      .equals("premium")
      .build();

    expect(query).toBe(
      'created>1704067200 AND email~"@example.com" AND metadata["plan"]:"premium"'
    );
  });

  describe("phone field", () => {
    it("should build a query with phone field using exact match", () => {
      const query = customerQuery().phone().equals("+15551234567").build();

      expect(query).toBe('phone:"+15551234567"');
    });

    it("should support negation on phone field", () => {
      const query = customerQuery().phone().not().equals("+15551234567").build();

      expect(query).toBe('-phone:"+15551234567"');
    });

    it("should support isNull on phone field", () => {
      const query = customerQuery().phone().isNull().build();

      expect(query).toBe("phone:null");
    });

    it("should not allow substring match (~) on phone field, since Stripe only supports exact match for phone", () => {
      expect(() => {
        // @ts-expect-error phone field does not support substring match; Stripe requires exact match (equals) for phone
        customerQuery().phone().contains("555");
      }).toThrow();
    });

    it("should toggle negation back to positive when not() is called twice", () => {
      const query = customerQuery().phone().not().not().equals("+15551234567").build();

      expect(query).toBe('phone:"+15551234567"');
    });
  });
});
