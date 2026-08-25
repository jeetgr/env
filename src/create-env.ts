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
 * Create a typed, validated env object from a Standard Schema.
 *
 * This package is isomorphic: it has no Node or browser globals. You pass
 * the env bag, so it works the same in Node, Vite, webpack, and tests.
 */
const createEnv = <T extends StandardSchemaV1>({
  schema,
  env,
}: CreateEnvOptions<T>): InferEnv<T> => {
  const validation = schema["~standard"].validate(env);

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
