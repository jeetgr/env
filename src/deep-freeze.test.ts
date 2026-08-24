import { describe, expect, it } from "vitest";

import { deepFreeze } from "./deep-freeze.js";

describe("deepFreeze", () => {
  it("freezes a plain object and its nested plain objects/arrays", () => {
    const value = deepFreeze({
      port: 3000,
      flags: { beta: true },
      origins: ["https://example.com"],
    });

    expect(Object.isFrozen(value)).toBe(true);
    expect(Object.isFrozen(value.flags)).toBe(true);
    expect(Object.isFrozen(value.origins)).toBe(true);
  });

  it("passes primitives through untouched", () => {
    expect(deepFreeze(3000)).toBe(3000);
    expect(deepFreeze("hello")).toBe("hello");
    expect(deepFreeze(true)).toBe(true);
    expect(deepFreeze(null)).toBe(null);
    // eslint-disable-next-line unicorn/no-useless-undefined -- deepFreeze() with no args is a type error; explicit undefined is the actual input under test
    expect(deepFreeze(undefined)).toBeUndefined();
  });

  it("freezes a Date at its own level without descending into it", () => {
    const date = new Date("2024-01-01");
    const value = deepFreeze({ startedAt: date });

    expect(Object.isFrozen(value.startedAt)).toBe(true);
    expect(value.startedAt.getTime()).toBe(date.getTime());
  });

  it("does not throw on a circular reference", () => {
    const value: { self?: unknown } = {};
    value.self = value;

    expect(() => deepFreeze(value)).not.toThrow();
    expect(Object.isFrozen(value)).toBe(true);
  });

  it("throws when mutating a frozen nested field", () => {
    const value = deepFreeze({ flags: { beta: true } });

    expect(() => {
      // @ts-expect-error -- intentionally mutating a readonly field to prove it's frozen
      value.flags.beta = false;
    }).toThrow(TypeError);
  });
});
