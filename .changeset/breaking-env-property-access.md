---
"@jeetgr/env": minor
---

**Breaking:** `createEnv()` now returns a validated env object with property access (`env.PORT`) instead of a getter function (`env("PORT")`), matching the convention used by t3-env and similar libraries. The returned object is also deeply frozen, so nested fields are guaranteed immutable at both compile time and runtime.

Migration:

```diff
-console.log(env("PORT"));
+console.log(env.PORT);
```
