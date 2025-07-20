import { describe, it, expect } from "vitest";
import { z } from "zod/v4";
import { parseEnv } from "./index";

const schema = z.object({
  PORT: z.coerce.number(),
  NODE_ENV: z.enum(["development", "production", "test"]),
});

describe("parseEnv (test using zod)", () => {
  it("returns typed values when schema is valid", () => {
    const env = parseEnv({
      schema,
      source: { PORT: "3000", NODE_ENV: "production" },
    });

    expect(env("PORT")).toBe(3000);
    expect(env("NODE_ENV")).toBe("production");
  });

  it("throws if validation fails", () => {
    expect(() =>
      parseEnv({
        schema,
        source: { PORT: "bad", NODE_ENV: "invalid" },
      })
    ).toThrow(/PORT|NODE_ENV/);
  });
});
