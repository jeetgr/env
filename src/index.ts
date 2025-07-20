import type { StandardSchemaV1 } from "@standard-schema/spec";

export type ParseEnvParams<T extends StandardSchemaV1> = {
  schema: T;
  source: { readonly [key: string]: string | undefined };
};

export const parseEnv = <T extends StandardSchemaV1>({
  schema,
  source = process.env,
}: ParseEnvParams<T>) => {
  const result = schema["~standard"].validate(source);

  if (result instanceof Promise) {
    throw new TypeError("Schema validation must be synchronous");
  }

  if (result.issues) {
    throw new Error(JSON.stringify(result.issues, null, 2));
  }

  const _env = result.value as StandardSchemaV1.InferOutput<T>;

  type EnvKeys = keyof typeof _env;

  const env = <K extends EnvKeys>(name: K): (typeof _env)[K] => _env[name];

  return env;
};
