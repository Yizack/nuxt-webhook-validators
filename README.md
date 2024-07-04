![webhook-validators](https://github.com/Yizack/nuxt-webhook-validators/assets/16264115/56cded71-46b2-4895-8732-484ab6df5181)

# Nuxt Webhook Validators

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]
[![Modules][modules-src]][modules-href]

A simple nuxt module that works on the edge to easily validate incoming webhooks from different services.

- [✨ Release Notes](CHANGELOG.md)

## Features

- 6 [Webhook validators](#supported-webhook-validators)
- Works on the edge
- Exposed [Server utils](#server-utils)

## Requirements

This module only works with a Nuxt server running as it uses server API routes (`nuxt build`).

This means that you cannot use this module with `nuxt generate`.

## Quick Setup

1. Add nuxt-webhook-validators in your Nuxt project

```
pnpm add nuxt-webhook-validators
```

2. Add the module in your `nuxt.config.ts`

```js
export default defineNuxtConfig({
  modules: [
    'nuxt-webhook-validators'
  ],
})
```


## Server utils

The validator helpers are auto-imported in your `server/` directory.

### Webhook Validators

All validator helpers are exposed globally and can be used in your server API routes.

The helpers return a boolean value indicating if the webhook request is valid or not.

The config can be defined directly from the `runtimeConfig` in your `nuxt.config.ts`:

```js
export default defineNuxtConfig({
  runtimeConfig: {
    webhook: {
      <provider>: {
        <requiredProps>: '',
      }
    }
  }
})
```

It can also be set using environment variables:

```sh
NUXT_WEBHOOK_<PROVIDER>_<REQUIRED_PROPERTY> = ""
```

Go to [playground/.env.example](./playground/.env.example) or [playground/nuxt.config.ts](./playground/nuxt.config.ts) to see a list of all the available properties needed for each provider.


#### Supported webhook validators:

- GitHub
- NuxtHub
- Paddle
- PayPal
- Stripe
- Twitch

You can add your favorite webhook validator by creating a new file in  [src/runtime/server/lib/validators/](./src/runtime/server/lib/validators/)

## Example

Validate a Paddle webhook in a server API route.

`~/server/api/webhooks/paddle.post.ts`

```js
export default defineEventHandler(async (event) => {
  const isValidWebhook = await isValidPaddleWebhook(event)

  if (!isValidWebhook) {
    throw createError({ statusCode: 401, message: 'Unauthorized: webhook is not valid' })
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

# Run typecheck
npm run test:types

# Release new version
npm run release
```

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-webhook-validators/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/nuxt-webhook-validators

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-webhook-validators.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npmjs.com/package/nuxt-webhook-validators

[license-src]: https://img.shields.io/npm/l/nuxt-webhook-validators.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: LICENSE

[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com

[modules-src]: https://img.shields.io/badge/Modules-020420?logo=nuxt.js
[modules-href]: https://nuxt.com/modules/webhook-validators
