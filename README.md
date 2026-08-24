# @jeetgr/env

A tiny utility to **create a typed, validated env object** by validating environment variables with a [Standard Schema](https://github.com/standard-schema/standard-schema)-compatible schema.

Works the same in **Node** and in **Vite** (and similar bundlers). You always pass the env bag — this package never reads `process.env` itself, so bundlers cannot inline or leak secrets.

---

## Features

- Validates `process.env`, `import.meta.env`, or any custom env bag
- Works with any schema compatible with [`@standard-schema/spec`](https://github.com/standard-schema/standard-schema)
- Returns a fully typed, frozen object of validated values
- Throws `EnvValidationError` (with `.issues`) on validation failure

---

## Installation

```bash
# npm
npm install @jeetgr/env

# yarn
yarn add @jeetgr/env

# pnpm
pnpm add @jeetgr/env

# bun
bun add @jeetgr/env
```

---

## Usage

This example uses [Zod](https://zod.dev), but you can use **any** Standard Schema library.

### Node

```ts
import { createEnv } from "@jeetgr/env";
import * as z from "zod";

const schema = z.object({
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string(),
});

const env = createEnv({ schema, env: process.env });

console.log(env.PORT);
console.log(env.DATABASE_URL);
```

### Vite (and similar bundlers)

Pass `import.meta.env`. Client-side Vite only exposes variables prefixed with `VITE_`.

```ts
import { createEnv } from "@jeetgr/env";
import * as z from "zod";

const schema = z.object({
  MODE: z.enum(["development", "production", "test"]),
  VITE_API_URL: z.url(),
});

const env = createEnv({ schema, env: import.meta.env });

console.log(env.MODE);
console.log(env.VITE_API_URL);
```

### Tests and custom env bags

```ts
const env = createEnv({
  schema,
  env: {
    PORT: "8080",
    DATABASE_URL: "postgres://localhost/db",
  },
});
```

---

## License

MIT © [Jeet Gangwar](https://github.com/jeetgr)
