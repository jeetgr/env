import { deepFreeze } from "./deep-freeze.js";
import type { DeepReadonly } from "./deep-freeze.js";
import { EnvValidationError } from "./errors.js";
import type { StandardSchemaV1 } from "./standard-schema-spec.js";

type CreateEnvOptions<T extends StandardSchemaV1> = {
  schema: T;
  /**
   * Env bag to validate. Pass `process.env` in Node, or `import.meta.env`
   * in Vite. Required: this package never reads `process.env` itself, so
   * bundlers can't inline or leak secrets.
   */
  env: unknown;
  /**
   * Treat `""` as unset before validating, so `FOO=""` doesn't block a
   * schema's `.default()`/`.optional()` (or get coerced to `0` by
   * `z.coerce.number()`). Only top-level values are affected. Default
   * `false`.
   */
  emptyStringAsUndefined?: boolean;
  /**
   * Skip validation and return `env` as-is, cast to the schema's output
   * type. For build steps (a Docker build, say) where the real env isn't
   * available yet but the code still needs to import without throwing.
   * Not frozen: `env` comes back by reference. Default `false`.
   */
  skipValidation?: boolean;
};

/**
 * The validated, deeply frozen shape `createEnv` returns for a given schema.
 * Use it to type a function parameter or module boundary elsewhere in your
 * app without importing the schema itself:
 *
 * ```ts
 * function connect(env: InferEnv<typeof schema>) { ... }
 * ```
 */
type InferEnv<T extends StandardSchemaV1> = DeepReadonly<
  StandardSchemaV1.InferOutput<T>
>;

/**
 * Replaces top-level `""` values with `undefined`. Env bags are flat, so
 * this doesn't recurse.
 */
const stripEmptyStrings = (env: unknown): unknown => {
  if (typeof env !== "object" || env === null) {
    return env;
  }

  const result: Record<PropertyKey, unknown> = {};

  for (const key of Reflect.ownKeys(env)) {
    const value = Reflect.get(env, key) as unknown;
    result[key] = value === "" ? undefined : value;
  }

  return result;
};

/**
 * Create a typed, validated env object from a Standard Schema.
 *
 * This package is isomorphic: it has no Node or browser globals. You pass
 * the env bag, so it works the same in Node, Vite, webpack, and tests.
 */
const createEnv = <T extends StandardSchemaV1>({
  schema,
  env,
  emptyStringAsUndefined = false,
  skipValidation = false,
}: CreateEnvOptions<T>): InferEnv<T> => {
  if (skipValidation) {
    // eslint-disable-next-line typescript/no-unsafe-type-assertion -- caller opted out of validation, so this is a type-level promise only
    return env as InferEnv<T>;
  }

  const input = emptyStringAsUndefined ? stripEmptyStrings(env) : env;

  const validation = schema["~standard"].validate(input);

  if (validation instanceof Promise) {
    throw new TypeError("Schema validation must be synchronous");
  }

  if (validation.issues) {
    throw new EnvValidationError(validation.issues);
  }

  const values = validation.value as StandardSchemaV1.InferOutput<T>;

  return deepFreeze(values);
};

export type { CreateEnvOptions, InferEnv };
export { createEnv };
