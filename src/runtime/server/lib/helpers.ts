import { subtle, type webcrypto } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { snakeCase } from 'scule'
import type { H3Event } from 'h3'
import type { RuntimeConfig } from '@nuxt/schema'
import { useRuntimeConfig } from '#imports'

/* Algorithms */
export const HMAC_SHA256 = { name: 'HMAC', hash: 'SHA-256' }
export const ED25519 = { name: 'Ed25519', namedCurve: 'Ed25519' }

export const encoder = new TextEncoder()

export const computeSignature = async (
  secretKey: string,
  algorithm: webcrypto.Algorithm,
  payload: string,
  options?: Partial<{ extractable: boolean, encoding: BufferEncoding }>,
) => {
  const key = await subtle.importKey('raw', encoder.encode(secretKey), algorithm, options?.extractable ?? false, ['sign'])
  const signature = await subtle.sign(algorithm.name, key, encoder.encode(payload))
  return Buffer.from(signature).toString(options?.encoding ?? 'hex')
}

export const verifyPublicSignature = async (
  publicKey: string,
  algorithm: webcrypto.Algorithm,
  payload: string,
  signature: string,
  options?: Partial<{ extractable: boolean, encoding: BufferEncoding }>,
) => {
  const publicKeyBuffer = Buffer.from(publicKey, 'hex')
  const webhookSignatureBuffer = Buffer.from(signature, 'hex')
  const key = await subtle.importKey('raw', publicKeyBuffer, algorithm, options?.extractable ?? false, ['verify'])
  const result = await subtle.verify(algorithm.name, key, webhookSignatureBuffer, encoder.encode(payload))
  return result
}

export const ensureConfiguration = <T extends keyof RuntimeConfig['webhook']>(provider: T, event?: H3Event) => {
  const runtimeConfig = useRuntimeConfig(event).webhook[provider]
  const missingKeys = Object.entries(runtimeConfig).filter(([_, value]) => !value).map(([key]) => key)
  if (!missingKeys.length) return runtimeConfig
  const environmentVariables = missingKeys.map(key => `NUXT_WEBHOOK_${provider.toUpperCase()}_${snakeCase(key).toUpperCase()}`)
  throw new Error(`Missing ${environmentVariables.join(' or ')} env ${missingKeys.length > 1 ? 'variables' : 'variable'}.`)
}
