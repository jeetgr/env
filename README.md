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

## Non-goals

- No `.env` file loading. Load files with `dotenv` or `dotenv-flow` first, then pass the result in as `env`.
- No client/server variable splitting. Write two schemas and call `createEnv` twice if you need that.
- No framework integration or CLI. It's one function.

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

### Handling validation errors

`createEnv` throws `EnvValidationError` on failure. It has an `.issues` array (the raw
[Standard Schema](https://github.com/standard-schema/standard-schema) issues) and a
`.message` that's already formatted for a terminal. A typical app boot just catches it
and exits:

```ts
import { createEnv, EnvValidationError } from "@jeetgr/env";

let env: ReturnType<typeof createEnv<typeof schema>>;

try {
  env = createEnv({ schema, env: process.env });
} catch (error) {
  if (error instanceof EnvValidationError) {
    console.error(error.message);
    process.exit(1);
  }
  throw error;
}
```

If you want to render the issues yourself instead, for example as JSON for a log
pipeline, use `.issues` directly, or `formatEnvIssues` for the same "✖ message / → at
path" output `.message` uses internally:

```ts
import { formatEnvIssues } from "@jeetgr/env";

if (error instanceof EnvValidationError) {
  logger.error({ issues: error.issues }); // structured
  console.error(formatEnvIssues(error.issues)); // or the same plain-text format
}
```

---

## License

MIT © [Jeet Gangwar](https://github.com/jeetgr)
