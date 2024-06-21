import { defineNuxtModule, createResolver, addServerImportsDir } from '@nuxt/kit'
import { defu } from 'defu'

export interface ModuleOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'webhooks-validator',
    configKey: 'webhooks',
    compatibility: {
      nuxt: '>=3.0.0',
    },
  },
  defaults: {},
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    addServerImportsDir(resolve('./runtime/server/utils'))

    const runtimeConfig = nuxt.options.runtimeConfig
    // Webhook settings
    runtimeConfig.webhooks = defu(runtimeConfig.webhooks, {})
    // Paddle Webhook
    runtimeConfig.webhooks.paddle = defu(runtimeConfig.webhooks.paddle, {
      webhookId: '',
    })
    // Paypal Webhook
    runtimeConfig.webhooks.paypal = defu(runtimeConfig.webhooks.paypal, {
      clientId: '',
      secretKey: '',
      webhookId: '',
    })
    // Twitch Webhook
    runtimeConfig.webhooks.twitch = defu(runtimeConfig.webhooks.twitch, {
      secretKey: '',
    })
  },
})
