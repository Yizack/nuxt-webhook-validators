# Nuxt Webhooks Validator

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

A simple nuxt module that works on the edge to easily validate incoming webhooks from different services.

## Features

- [Server utils](#server-utils)


## Requirements

This module only works with a Nuxt server running as it uses server API routes (`nuxt build`).

This means that you cannot use this module with `nuxt generate`.

## Quick Setup

1. Add nuxt-webhooks-validator in your Nuxt project

```
pnpm add nuxt-webhooks-validator
```

2. Add the module in your `nuxt.config.ts`

```js
export default defineNuxtConfig({
  modules: [
    'nuxt-webhooks-validator'
  ],
})
```


## Server utils

The validator helpers are auto-imported in your `server/` directory.

### Webhook Validators

All validator helpers are exposed from the `webhooks` global variable and can be used in your server routes or API routes.

The helpers return a boolean value indicating if the webhook request is valid or not.

The config can be defined directly from the `runtimeConfig` in your `nuxt.config.ts`:

```js
export default defineNuxtConfig({
  runtimeConfig: {
    webhooks: {
      <provider>: {
        <requiredProps>: '',
      }
    }
  }
})
```

It can also be set using environment variables:

```sh
NUXT_WEBHOOKS_<PROVIDER>_<REQUIRED_PROPERTY> = ""
```

Go to [playground/.env.example](./playground/.env.example) or [playground/nuxt.config.ts](./playground/nuxt.config.ts) to see a list of all the available properties needed for each provider.


Supported webhook validators:

- Paddle
- PayPal
- Twitch

You can add your favorite webhook validator by creating a new file in  [src/runtime/server/lib/validators/](./src/runtime/server/lib/validators/)

## Example

Validate a Paddle webhook in a server API route.

`~/server/api/webhooks.post.ts`

```js
export default defineEventHandler(async (event) => {
  const isValidWebhook = await webhooks.isValidPaddleWebhook(event)

  if (!isValidWebhook) {
    throw createError({ status: 400, message: 'Invalid webhook' })
  }

  // Some logic...

  return { isValidWebhook }
})
```

# Development

```sh
# Install dependencies
npm install

# Generate type stubs
npm run dev:prepare

# Develop with the playground
npm run dev

# Build the playground
npm run dev:build

# Run ESLint
npm run lint

# Run Vitest
npm run test
npm run test:watch

# Release new version
npm run release
```

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-webhooks-validator/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/nuxt-webhooks-validator

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-webhooks-validator.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npmjs.com/package/nuxt-webhooks-validator

[license-src]: https://img.shields.io/npm/l/nuxt-webhooks-validator.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/nuxt-webhooks-validator

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
