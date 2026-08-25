import { deepFreeze } from "./deep-freeze.js";
import type { DeepReadonly } from "./deep-freeze.js";
import { EnvValidationError } from "./errors.js";
import type { StandardSchemaV1 } from "./standard-schema-spec.js";

type CreateEnvOptions<T extends StandardSchemaV1> = {
  schema: T;
  /**
   * Env bag to validate. Pass `process.env` in Node, or `import.meta.env`
   * in Vite (and similar bundlers). Do not omit this — the library never
   * reads `process.env` itself, so bundlers cannot inline or leak secrets.
   */
  env: unknown;
  /**
   * Replace `""` values in the env bag with `undefined` before validating,
   * so `FOO=""` is treated as `FOO` being unset rather than a present,
   * empty value. Without this, a platform that leaves a field blank
   * instead of omitting it (or `z.coerce.number()` reading `""` as `0`)
   * can silently produce a value your schema's `.default()` or
   * `.optional()` never gets a chance to apply. Only top-level values are
   * affected, matching the flat shape of a real env bag. Off by default.
   */
  emptyStringAsUndefined?: boolean;
  /**
   * Skip validation and return `env` as-is, cast to the schema's output
   * type without checking it. For build steps (a Docker build stage, for
   * instance) where the real runtime env isn't available yet but the code
   * still needs to import without throwing. The returned value is **not**
   * deeply frozen in this mode, since `env` is returned by reference and
   * this package never mutates or wraps values it didn't produce itself.
   * Off by default.
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
 * Replaces top-level `""` values with `undefined`. The env bag is expected
 * to be flat, so this deliberately doesn't recurse.
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
