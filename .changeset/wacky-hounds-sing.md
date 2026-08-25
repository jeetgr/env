---
"@jeetgr/env": patch
---

Export `formatEnvIssues`, so consumers can render Standard Schema issues (CLI output, structured logs) without re-parsing `EnvValidationError.issues` themselves.
