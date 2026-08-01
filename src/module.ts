import { defineNuxtModule, createResolver, addServerImportsDir } from '@nuxt/kit'
import { defu } from 'defu'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
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
    addServerImportsDir(resolve('./runtime/server/lib/validators'))

    const runtimeConfig = nuxt.options.runtimeConfig
    // Webhook settings
    runtimeConfig.webhook = defu(runtimeConfig.webhook, {})
    // Bitbucket Webhook
    runtimeConfig.webhook.bitbucket = defu(runtimeConfig.webhook.bitbucket, {
      secretKey: '',
    })
    // Brevo Webhook
    runtimeConfig.webhook.brevo = defu(runtimeConfig.webhook.brevo, {
      token: '',
    })
    // Cal.com Webhook
    runtimeConfig.webhook.calcom = defu(runtimeConfig.webhook.calcom, {
      secretKey: '',
    })
    // Discord Webhook
    runtimeConfig.webhook.discord = defu(runtimeConfig.webhook.discord, {
      publicKey: '',
    })
    // Dropbox Webhook
    runtimeConfig.webhook.dropbox = defu(runtimeConfig.webhook.dropbox, {
      appSecret: '',
    })
    // Fourthwall Webhook
    runtimeConfig.webhook.fourthwall = defu(runtimeConfig.webhook.fourthwall, {
      secretKey: '',
    })
    // GitHub Webhook
    runtimeConfig.webhook.github = defu(runtimeConfig.webhook.github, {
      secretKey: '',
    })
    // GitLab Webhook
    runtimeConfig.webhook.gitlab = defu(runtimeConfig.webhook.gitlab, {
      secretToken: '',
    })
    // Heroku Webhook
    runtimeConfig.webhook.heroku = defu(runtimeConfig.webhook.heroku, {
      secretKey: '',
    })
    // Hygraph Webhook
    runtimeConfig.webhook.hygraph = defu(runtimeConfig.webhook.hygraph, {
      secretKey: '',
    })
    // Kick Webhook
    runtimeConfig.webhook.kick = defu(runtimeConfig.webhook.kick, {
      publicKey: '',
    })
    // MailChannels Webhook
    runtimeConfig.webhook.mailchannels = defu(runtimeConfig.webhook.mailchannels, {
      publicKey: '',
    })
    // Meta Webhook
    runtimeConfig.webhook.meta = defu(runtimeConfig.webhook.meta, {
      appSecret: '',
    })
    // Netlify Webhook
    runtimeConfig.webhook.netlify = defu(runtimeConfig.webhook.netlify, {
      secretKey: '',
    })
    // Paddle Webhook
    runtimeConfig.webhook.paddle = defu(runtimeConfig.webhook.paddle, {
      webhookId: '',
    })
    // PayPal Webhook
    runtimeConfig.webhook.paypal = defu(runtimeConfig.webhook.paypal, {
      clientId: '',
      secretKey: '',
      webhookId: '',
    })
    // Polar Webhook
    runtimeConfig.webhook.polar = defu(runtimeConfig.webhook.polar, {
      secretKey: '',
    })
    // Resend Webhook
    runtimeConfig.webhook.resend = defu(runtimeConfig.webhook.resend, {
      secretKey: '',
    })
    // Shopify Webhook
    runtimeConfig.webhook.shopify = defu(runtimeConfig.webhook.shopify, {
      secretKey: '',
    })
    // Slack Webhook
    runtimeConfig.webhook.slack = defu(runtimeConfig.webhook.slack, {
      secretKey: '',
    })
    // Stripe Webhook
    runtimeConfig.webhook.stripe = defu(runtimeConfig.webhook.stripe, {
      secretKey: '',
    })
    // Svix Webhook
    runtimeConfig.webhook.svix = defu(runtimeConfig.webhook.svix, {
      secretKey: '',
    })
    // Twitch Webhook
    runtimeConfig.webhook.twitch = defu(runtimeConfig.webhook.twitch, {
      secretKey: '',
    })
    // Vercel Webhook
    runtimeConfig.webhook.vercel = defu(runtimeConfig.webhook.vercel, {
      secretKey: '',
    })
  },
})
