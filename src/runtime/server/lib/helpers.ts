import { subtle, type webcrypto } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { snakeCase } from 'scule'
import { type H3Event, createError } from 'h3'
import type { RuntimeConfig } from '@nuxt/schema'
import { useRuntimeConfig } from '#imports'

/* Algorithms */
export const HMAC_SHA256 = { name: 'HMAC', hash: 'SHA-256' }
export const ED25519 = { name: 'Ed25519', namedCurve: 'Ed25519' }
export const RSASSA_PKCS1_v1_5_SHA256 = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }

export const encoder = new TextEncoder()

export const computeSignature = async (
  secretKey: string,
  algorithm: webcrypto.Algorithm,
  payload: string,
  options?: Partial<{
    extractable: boolean
    encoding: BufferEncoding
    decodeKey: boolean
  }>,
) => {
  const encoding = options?.encoding ?? 'hex'
  const secretKeyBuffer = options?.decodeKey ? Buffer.from(secretKey, encoding) : encoder.encode(secretKey)

  const key = await subtle.importKey('raw', secretKeyBuffer, algorithm, Boolean(options?.extractable), ['sign'])
  const signature = await subtle.sign(algorithm.name, key, encoder.encode(payload))
  return Buffer.from(signature).toString(encoding)
}

export const verifyPublicSignature = async (
  publicKey: string,
  algorithm: webcrypto.Algorithm,
  payload: string,
  signature: string,
  options?: Partial<{
    extractable: boolean
    encoding: BufferEncoding
    format: Exclude<webcrypto.KeyFormat, 'jwk'>
  }>,
) => {
  const encoding = options?.encoding ?? 'hex'
  const format = options?.format ?? 'raw'

  const publicKeyBuffer = Buffer.from(publicKey, encoding)
  const webhookSignatureBuffer = Buffer.from(signature, encoding)

  const key = await subtle.importKey(format, publicKeyBuffer, algorithm, Boolean(options?.extractable), ['verify'])
  const result = await subtle.verify(algorithm.name, key, webhookSignatureBuffer, encoder.encode(payload))
  return result
}

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
    statusCode: 500,
    message: errorMessage,
  })
}

export const stripPemHeaders = (pem: string) => pem.replace(/-----[^-]+-----|\s/g, '')

export const sha256 = async (payload: string | object, encoding?: BufferEncoding) => {
  const buffer = typeof payload === 'object' ? Buffer.from(JSON.stringify(payload)) : encoder.encode(payload)
  const signatureBuffer = await subtle.digest(HMAC_SHA256.hash, buffer)
  return Buffer.from(signatureBuffer).toString(encoding ?? 'hex')
}

export const validateSha256 = async (
  hash: string,
  payload: string,
  options?: Partial<{
    encoding: BufferEncoding
  }>,
) => {
  return hash === await sha256(payload, options?.encoding)
}
