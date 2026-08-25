---
"@jeetgr/env": patch
---

Fix `deepFreeze` to recurse into `Object.create(null)` values, not just object literals. Previously a null-prototype object nested in schema output was frozen at its own level but its children were left mutable.
