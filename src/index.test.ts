import { describe, expect, it } from "vitest";
import { z } from "zod";

import { createEnv, EnvValidationError } from "./index.js";
import type { InferEnv } from "./index.js";
import type { StandardSchemaV1 } from "./standard-schema-spec.js";

const schema = z.object({
  PORT: z.coerce.number(),
  NODE_ENV: z.enum(["development", "production", "test"]),
});

const readPort = (config: InferEnv<typeof schema>): number => config.PORT;

describe("createEnv (test using zod)", () => {
  it("returns typed values when schema is valid", () => {
    const env = createEnv({
      schema,
      env: { PORT: "3000", NODE_ENV: "production" },
    });

    expect(env.PORT).toBe(3000);
    expect(env.NODE_ENV).toBe("production");
  });

  it("returns a deeply frozen object", () => {
    const nestedSchema = z.object({
      PORT: z.coerce.number(),
      FEATURE_FLAGS: z.object({ beta: z.boolean() }),
      ALLOWED_ORIGINS: z.array(z.string()),
    });

    const env = createEnv({
      schema: nestedSchema,
      env: {
        PORT: "3000",
        FEATURE_FLAGS: { beta: true },
        ALLOWED_ORIGINS: ["https://example.com"],
      },
    });

    expect(Object.isFrozen(env)).toBe(true);
    expect(Object.isFrozen(env.FEATURE_FLAGS)).toBe(true);
    expect(Object.isFrozen(env.ALLOWED_ORIGINS)).toBe(true);

    expect(() => {
      // @ts-expect-error -- intentionally mutating a readonly field to prove it's frozen
      env.FEATURE_FLAGS.beta = false;
    }).toThrow(TypeError);
  });

  it("rejects a schema whose validate() is async", () => {
    const asyncSchema: StandardSchemaV1<unknown, { PORT: number }> = {
      "~standard": {
        version: 1,
        vendor: "test",
        validate: () => Promise.resolve({ value: { PORT: 3000 } }),
      },
    };

    expect(() =>
      createEnv({ schema: asyncSchema, env: { PORT: "3000" } })
    ).toThrow(/synchronous/);
  });

  it("throws EnvValidationError with issues when validation fails", () => {
    expect(() =>
      createEnv({
        schema,
        env: { PORT: "bad", NODE_ENV: "invalid" },
      })
    ).toThrow(EnvValidationError);

    try {
      createEnv({
        schema,
        env: { PORT: "bad", NODE_ENV: "invalid" },
      });
    } catch (error) {
      expect(error).toBeInstanceOf(EnvValidationError);
      if (!(error instanceof EnvValidationError)) {
        throw error;
      }
      expect(error.issues.length).toBeGreaterThan(0);
      expect(error.message).toMatch(/PORT|NODE_ENV/);
    }
  });

  it("InferEnv describes the value createEnv returns", () => {
    const env = createEnv({
      schema,
      env: { PORT: "3000", NODE_ENV: "production" },
    });

    expect(readPort(env)).toBe(3000);
  });

  it("accepts a Vite-like import.meta.env bag (booleans + prefixed strings)", () => {
    const viteSchema = z.object({
      MODE: z.enum(["development", "production", "test"]),
      DEV: z.boolean(),
      VITE_API_URL: z.url(),
    });

    const env = createEnv({
      schema: viteSchema,
      env: {
        MODE: "development",
        DEV: true,
        PROD: false,
        VITE_API_URL: "https://api.example.com",
      },
    });

    expect(env.MODE).toBe("development");
    expect(env.DEV).toBe(true);
    expect(env.VITE_API_URL).toBe("https://api.example.com");
  });

  it("skipValidation bypasses the schema and returns env by reference", () => {
    const rawEnv = { PORT: "not-a-number", NODE_ENV: "not-a-real-env" };

    const env = createEnv({ schema, env: rawEnv, skipValidation: true });

    expect(env).toBe(rawEnv);
    expect(Object.isFrozen(env)).toBe(false);
  });

  it("emptyStringAsUndefined lets a default apply instead of coercing an empty string to 0", () => {
    const portSchema = z.object({
      PORT: z.coerce.number().default(3000),
      NODE_ENV: z.string(),
    });

    const withoutOption = createEnv({
      schema: portSchema,
      env: { PORT: "", NODE_ENV: "production" },
    });
    expect(withoutOption.PORT).toBe(0);

    const withOption = createEnv({
      schema: portSchema,
      env: { PORT: "", NODE_ENV: "production" },
      emptyStringAsUndefined: true,
    });
    expect(withOption.PORT).toBe(3000);
    expect(withOption.NODE_ENV).toBe("production");
  });

  it("emptyStringAsUndefined turns an empty string into undefined for an optional field", () => {
    const flagSchema = z.object({ FEATURE_FLAG: z.string().optional() });

    const withoutOption = createEnv({
      schema: flagSchema,
      env: { FEATURE_FLAG: "" },
    });
    expect(withoutOption.FEATURE_FLAG).toBe("");

    const withOption = createEnv({
      schema: flagSchema,
      env: { FEATURE_FLAG: "" },
      emptyStringAsUndefined: true,
    });
    expect(withOption.FEATURE_FLAG).toBeUndefined();
  });

  it("emptyStringAsUndefined passes a non-object env bag through untouched", () => {
    expect(() =>
      createEnv({ schema, env: "not an object", emptyStringAsUndefined: true })
    ).toThrow(EnvValidationError);
  });
});
