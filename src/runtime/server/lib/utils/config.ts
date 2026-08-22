import { snakeCase } from 'scule'
import { type H3Event, createError } from 'h3'
import type { RuntimeConfig } from '@nuxt/schema'
import { useRuntimeConfig } from '#imports'

type Optional<T, K extends keyof T>
  = Omit<T, K> & Partial<Pick<T, K>> extends infer O
    ? { [P in keyof O]: O[P] }
    : never

type WebhookProviders = keyof RuntimeConfig['webhook']
type WebhookProviderOptions<T extends WebhookProviders> = keyof RuntimeConfig['webhook'][T]
type WebhookConfig<T extends WebhookProviders, K extends WebhookProviderOptions<T> = never>
  = [K] extends [never] ? RuntimeConfig['webhook'][T] : Optional<RuntimeConfig['webhook'][T], K>

export const configContext: { provider: WebhookProviders | null } = {
  provider: null,
}

export const ensureConfiguration = <T extends WebhookProviders, K extends WebhookProviderOptions<T> = never>(
  provider: T,
  event?: H3Event,
  options?: {
    optional?: K[]
    matrix?: K[][]
  },
) => {
  if (configContext.provider) provider = configContext.provider as T
  const runtimeConfig = useRuntimeConfig(event).webhook[provider]
  if (configContext.provider) configContext.provider = null

  const anyFullySatisfied = options?.matrix?.some(m => m.every(key => runtimeConfig[key]))
  const nonPartialKeys = new Set(options?.matrix
    ?.filter(m => !(m.some(key => runtimeConfig[key]) && !m.every(key => runtimeConfig[key])))
    .flat() ?? [],
  )

  const missingKeys = Object.entries(runtimeConfig)
    .filter(([key, value]) => !value
      && !(options?.optional?.includes(key as K))
      && !(anyFullySatisfied && nonPartialKeys.has(key as K)),
    )
    .map(([key]) => key)

  if (!missingKeys.length) return runtimeConfig as WebhookConfig<T, K>

  const environmentVariables = missingKeys.map(key => `NUXT_WEBHOOK_${provider.toUpperCase()}_${snakeCase(key).toUpperCase()}`)
  const errorMessage = `Missing ${environmentVariables.join(' or ')} env ${missingKeys.length > 1 ? 'variables' : 'variable'}.`
  console.error(errorMessage)
  throw createError({
    status: 500,
    message: errorMessage,
  })
}

export const stripPemHeaders = (pem: string) => pem.replace(/-----[^-]+-----|\s/g, '')
