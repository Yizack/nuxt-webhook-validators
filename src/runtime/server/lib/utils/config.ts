import { snakeCase } from 'scule'
import { type H3Event, createError } from 'h3'
import type { RuntimeConfig } from '@nuxt/schema'
import { useRuntimeConfig } from '#imports'

export const configContext: { provider: keyof RuntimeConfig['webhook'] | null } = {
  provider: null,
}

export const ensureConfiguration = <T extends keyof RuntimeConfig['webhook']>(provider: T, event?: H3Event) => {
  if (configContext.provider) provider = configContext.provider as T
  const runtimeConfig = useRuntimeConfig(event).webhook[provider]
  if (configContext.provider) configContext.provider = null

  const missingKeys = Object.entries(runtimeConfig).filter(([_, value]) => !value).map(([key]) => key)
  if (!missingKeys.length) return runtimeConfig

  const environmentVariables = missingKeys.map(key => `NUXT_WEBHOOK_${provider.toUpperCase()}_${snakeCase(key).toUpperCase()}`)
  const errorMessage = `Missing ${environmentVariables.join(' or ')} env ${missingKeys.length > 1 ? 'variables' : 'variable'}.`
  console.error(errorMessage)
  throw createError({
    status: 500,
    message: errorMessage,
  })
}

export const stripPemHeaders = (pem: string) => pem.replace(/-----[^-]+-----|\s/g, '')
