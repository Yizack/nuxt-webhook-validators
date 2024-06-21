import { defineNuxtModule, createResolver, addServerImportsDir } from '@nuxt/kit'
import { defu } from 'defu'

export interface ModuleOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'webhook-validators',
    configKey: 'webhook',
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
    runtimeConfig.webhook = defu(runtimeConfig.webhook, {})
    // Paddle Webhook
    runtimeConfig.webhook.paddle = defu(runtimeConfig.webhook.paddle, {
      webhookId: '',
    })
    // Paypal Webhook
    runtimeConfig.webhook.paypal = defu(runtimeConfig.webhook.paypal, {
      clientId: '',
      secretKey: '',
      webhookId: '',
    })
    // Twitch Webhook
    runtimeConfig.webhook.twitch = defu(runtimeConfig.webhook.twitch, {
      secretKey: '',
    })
  },
})
