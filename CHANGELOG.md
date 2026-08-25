# @jeetgr/env

## 0.2.0

### Minor Changes

- 6173643: Add two `createEnv` options, both off by default: `emptyStringAsUndefined` treats `""` values in the env bag as unset before validating, so a schema's `.default()`/`.optional()` applies instead of e.g. `z.coerce.number()` reading `""` as `0`. `skipValidation` bypasses validation entirely and returns `env` by reference, for build steps where the real runtime env isn't available yet.
- 01746fb: Export `InferEnv<T>`, the type `createEnv` returns for a given schema, so other modules can type a parameter or function boundary without importing the schema directly.

### Patch Changes

- 8779d0a: Fix `deepFreeze` to recurse into `Object.create(null)` values, not just object literals. Previously a null-prototype object nested in schema output was frozen at its own level but its children were left mutable.
- 37fbb75: Export `formatEnvIssues`, so consumers can render Standard Schema issues (CLI output, structured logs) without re-parsing `EnvValidationError.issues` themselves.

## 0.1.0

### Minor Changes

- aa8a768: **Breaking:** `createEnv()` now returns a validated env object with property access (`env.PORT`) instead of a getter function (`env("PORT")`), matching the convention used by t3-env and similar libraries. The returned object is also deeply frozen, so nested fields are guaranteed immutable at both compile time and runtime.

  Migration:

  ```diff
  -console.log(env("PORT"));
  +console.log(env.PORT);
  ```
