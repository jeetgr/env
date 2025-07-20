# @jeetgr/env

A tiny utility to **synchronously parse and validate environment variables** using a [Standard Schema](https://github.com/standard-schema/standard-schema)-compatible schema.

---

## 🚀 Features

- ✅ Validates `process.env` or a custom source
- ✅ Works with any schema compatible with [`@standard-schema/spec`](https://github.com/standard-schema/standard-schema)
- ✅ Synchronous-only validation (fails fast if async)
- ✅ Returns a fully typed accessor function to read validated environment variables

---

## 📦 Installation

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

## 🧪 Example

This example uses [Zod](https://zod.dev), but you can use **any validation library** that supports `@standard-schema/spec`.

```ts
import { parseEnv } from '@jeetgr/env'
import * as z from 'zod'

const schema = z.object({
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string(),
})

const env = parseEnv({ schema })

console.log(env('PORT'))         // => 3000 (or value from process.env)
console.log(env('DATABASE_URL')) // => value from process.env
```

You can also pass a custom source (e.g. for testing):

```ts
const env = parseEnv({
  schema,
  source: {
    PORT: '8080',
    DATABASE_URL: 'postgres://localhost/db',
  },
})

console.log(env('PORT'))         // => 8080
console.log(env('DATABASE_URL')) // => postgres://localhost/db
```

---

## 📄 License

MIT © [Jeet Gangwar](https://github.com/jeetgr)