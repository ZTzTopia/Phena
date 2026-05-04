import { describe, it, expect } from "bun:test";
import {
  parseTemplate,
  evaluateExpression,
  evaluateTemplate,
  validateTemplate,
  DEFAULT_FLAG_TEMPLATE,
} from "./flag-expression";

describe("parseTemplate", () => {
  it("parses single expression", () => {
    const result = parseTemplate("PHENA{{{uuid}}}");
    expect(result).toHaveLength(4);
    expect(result[0]).toEqual({ type: "literal", value: "PHENA" });
    expect(result[1]).toEqual({ type: "literal", value: "{" });
    expect(result[2]).toEqual({ type: "expression", name: "uuid" });
    expect(result[3]).toEqual({ type: "literal", value: "}" });
  });

  it("parses multiple expressions", () => {
    const result = parseTemplate("PHENA{{{challengeId}}_{{teamId}}_{{random[16]}}}");
    expect(result).toHaveLength(8);
    expect(result[0]).toEqual({ type: "literal", value: "PHENA" });
    expect(result[1]).toEqual({ type: "literal", value: "{" });
    expect(result[2]).toEqual({ type: "expression", name: "challengeId" });
    expect(result[3]).toEqual({ type: "literal", value: "_" });
    expect(result[4]).toEqual({ type: "expression", name: "teamId" });
    expect(result[5]).toEqual({ type: "literal", value: "_" });
    expect(result[6]).toEqual({ type: "expression", name: "random[16]" });
    expect(result[7]).toEqual({ type: "literal", value: "}" });
  });

  it("parses no expressions", () => {
    const result = parseTemplate("STATIC_FLAG");
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ type: "literal", value: "STATIC_FLAG" });
  });

  it("parses empty template", () => {
    const result = parseTemplate("");
    expect(result).toHaveLength(0);
  });
});

describe("evaluateExpression", () => {
  const ctx = {
    challengeId: 5,
    teamId: 3,
    serviceId: 12,
    round: 2,
    tick: 7,
    index: 0,
  };

  it("evaluates challengeId", () => {
    const result = evaluateExpression("challengeId", ctx);
    expect(result).toBe("5");
  });

  it("evaluates all context variables", () => {
    expect(evaluateExpression("teamId", ctx)).toBe("3");
    expect(evaluateExpression("serviceId", ctx)).toBe("12");
    expect(evaluateExpression("round", ctx)).toBe("2");
    expect(evaluateExpression("tick", ctx)).toBe("7");
    expect(evaluateExpression("index", ctx)).toBe("0");
  });

  it("evaluates uuid", () => {
    const result = evaluateExpression("uuid", ctx);
    expect(result).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  it("evaluates date", () => {
    const result = evaluateExpression("date", ctx);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("evaluates timestamp", () => {
    const result = evaluateExpression("timestamp", ctx);
    expect(Number(result)).toBeGreaterThan(0);
  });

  it("evaluates md5", () => {
    const result = evaluateExpression("md5", ctx);
    expect(result).toHaveLength(32);
    expect(result).toMatch(/^[a-f0-9]+$/);
  });

  it("evaluates sha256", () => {
    const result = evaluateExpression("sha256", ctx);
    expect(result).toHaveLength(64);
    expect(result).toMatch(/^[a-f0-9]+$/);
  });
});

describe("random[N]", () => {
  it("generates correct length", () => {
    const result = evaluateExpression("random[16]", {
      challengeId: 1,
      teamId: 1,
      serviceId: 1,
      round: 1,
      tick: 1,
      index: 0,
    });
    expect(result).toHaveLength(16);
    expect(result).toMatch(/^[A-Za-z0-9]+$/);
  });

  it("returns error for length 0", () => {
    const result = evaluateExpression("random[0]", {
      challengeId: 1,
      teamId: 1,
      serviceId: 1,
      round: 1,
      tick: 1,
      index: 0,
    });
    expect(result).toBeInstanceOf(Error);
  });

  it("returns error for length > 128", () => {
    const result = evaluateExpression("random[200]", {
      challengeId: 1,
      teamId: 1,
      serviceId: 1,
      round: 1,
      tick: 1,
      index: 0,
    });
    expect(result).toBeInstanceOf(Error);
  });

  it("returns error for unknown expression", () => {
    const result = evaluateExpression("foobar", {
      challengeId: 1,
      teamId: 1,
      serviceId: 1,
      round: 1,
      tick: 1,
      index: 0,
    });
    expect(result).toBeInstanceOf(Error);
  });

  it("returns error for random with non-numeric", () => {
    const result = evaluateExpression("random[abc]", {
      challengeId: 1,
      teamId: 1,
      serviceId: 1,
      round: 1,
      tick: 1,
      index: 0,
    });
    expect(result).toBeInstanceOf(Error);
  });

  it("returns error for random with empty brackets", () => {
    const result = evaluateExpression("random[]", {
      challengeId: 1,
      teamId: 1,
      serviceId: 1,
      round: 1,
      tick: 1,
      index: 0,
    });
    expect(result).toBeInstanceOf(Error);
  });

  it("generates unique values", () => {
    const ctx = {
      challengeId: 1,
      teamId: 1,
      serviceId: 1,
      round: 1,
      tick: 1,
      index: 0,
    };
    const results = new Set<string>();
    for (let i = 0; i < 100; i++) {
      const result = evaluateExpression("random[32]", ctx);
      results.add(result as string);
    }
    expect(results.size).toBe(100);
  });
});

describe("evaluateTemplate", () => {
  it("evaluates full template", () => {
    const result = evaluateTemplate("PHENA{{{challengeId}}_{{teamId}}}", {
      challengeId: 1,
      teamId: 3,
      serviceId: 7,
      round: 1,
      tick: 1,
      index: 0,
    });
    expect(result).toBe("PHENA{1_3}");
  });

  it("evaluates static template", () => {
    const result = evaluateTemplate("STATIC_FLAG", {
      challengeId: 1,
      teamId: 1,
      serviceId: 1,
      round: 1,
      tick: 1,
      index: 0,
    });
    expect(result).toBe("STATIC_FLAG");
  });

  it("returns error for invalid expression", () => {
    const result = evaluateTemplate("PHENA{{{invalid}}}", {
      challengeId: 1,
      teamId: 1,
      serviceId: 1,
      round: 1,
      tick: 1,
      index: 0,
    });
    expect(result).toBeInstanceOf(Error);
  });

  it("uses default template constant", () => {
    expect(DEFAULT_FLAG_TEMPLATE).toBe("PHENA{{{uuid}}}");
  });
});

describe("validateTemplate", () => {
  it("validates correct template", () => {
    const result = validateTemplate("PHENA{{{random[32]}}}");
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("invalidates unknown expression", () => {
    const result = validateTemplate("PHENA{{{foobar}}}");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Unknown expression: foobar");
  });

  it("invalidates empty expression", () => {
    const result = validateTemplate("PHENA{{{}}}");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Empty expression at position 5");
  });

  it("invalidates unclosed expression", () => {
    const result = validateTemplate("PHENA{{{uuid");
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("Unclosed expression"))).toBe(true);
  });

  it("invalidates random with non-numeric", () => {
    const result = validateTemplate("PHENA{{{random[abc]}}}");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("random[N] requires N between 1 and 128, got abc");
  });

  it("invalidates random with missing bracket", () => {
    const result = validateTemplate("PHENA{{{random[16}}}");
    expect(result.valid).toBe(false);
  });

  it("validates simple expressions", () => {
    expect(validateTemplate("PHENA{{{challengeId}}}").valid).toBe(true);
    expect(validateTemplate("PHENA{{{teamId}}}").valid).toBe(true);
    expect(validateTemplate("PHENA{{{serviceId}}}").valid).toBe(true);
    expect(validateTemplate("PHENA{{{round}}}").valid).toBe(true);
    expect(validateTemplate("PHENA{{{tick}}}").valid).toBe(true);
    expect(validateTemplate("PHENA{{{index}}}").valid).toBe(true);
  });

  it("collects multiple errors", () => {
    const result = validateTemplate("PHENA{{{foobar}}{{{}}}");
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });
});
