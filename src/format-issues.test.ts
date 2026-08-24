import { describe, expect, it } from "vitest";

import { formatEnvIssues } from "./format-issues.js";

describe("formatEnvIssues", () => {
  it("formats an issue with no path", () => {
    expect(formatEnvIssues([{ message: "Required" }])).toBe("✖ Required");
  });

  it("formats an issue with a bare PropertyKey path", () => {
    expect(
      formatEnvIssues([{ message: "Invalid input", path: ["PORT"] }])
    ).toBe("✖ Invalid input\n  → at PORT");
  });

  it("formats an issue with an object-form path segment", () => {
    expect(
      formatEnvIssues([{ message: "Invalid input", path: [{ key: "PORT" }] }])
    ).toBe("✖ Invalid input\n  → at PORT");
  });

  it("joins nested and mixed-form path segments with dots", () => {
    expect(
      formatEnvIssues([
        {
          message: "Invalid input",
          path: ["FEATURE_FLAGS", { key: "beta" }],
        },
      ])
    ).toBe("✖ Invalid input\n  → at FEATURE_FLAGS.beta");
  });

  it("treats an empty path the same as no path", () => {
    expect(formatEnvIssues([{ message: "Required", path: [] }])).toBe(
      "✖ Required"
    );
  });

  it("joins multiple issues with newlines", () => {
    expect(
      formatEnvIssues([
        { message: "Required", path: ["PORT"] },
        { message: "Invalid enum value", path: ["NODE_ENV"] },
      ])
    ).toBe("✖ Required\n  → at PORT\n✖ Invalid enum value\n  → at NODE_ENV");
  });
});
