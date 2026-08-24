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
 * Create a typed, validated env object from a Standard Schema.
 *
 * This package is isomorphic: it has no Node or browser globals. You pass
 * the env bag, so it works the same in Node, Vite, webpack, and tests.
 */
const createEnv = <T extends StandardSchemaV1>({
  schema,
  env,
}: CreateEnvOptions<T>): DeepReadonly<StandardSchemaV1.InferOutput<T>> => {
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

export type { CreateEnvOptions };
export { createEnv };
