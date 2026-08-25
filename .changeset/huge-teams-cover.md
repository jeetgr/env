---
"@jeetgr/env": minor
---

Add two `createEnv` options, both off by default: `emptyStringAsUndefined` treats `""` values in the env bag as unset before validating, so a schema's `.default()`/`.optional()` applies instead of e.g. `z.coerce.number()` reading `""` as `0`. `skipValidation` bypasses validation entirely and returns `env` by reference, for build steps where the real runtime env isn't available yet.
