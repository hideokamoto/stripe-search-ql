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

    expect(query).toBe('created>1704067200 AND email~"@example.com" AND metadata["plan"]:"premium"');
  });
});
