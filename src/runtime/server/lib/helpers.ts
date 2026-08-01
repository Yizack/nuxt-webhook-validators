import { subtle, type webcrypto } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { snakeCase } from 'scule'
import { type H3Event, createError, readRawBody } from 'h3'
import type { RuntimeConfig } from '@nuxt/schema'
import { useRuntimeConfig } from '#imports'

/* Algorithms */
export const HMAC_SHA256 = { name: 'HMAC', hash: 'SHA-256' }
export const ED25519 = { name: 'Ed25519', namedCurve: 'Ed25519' }
export const RSASSA_PKCS1_v1_5_SHA256 = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }
export const HMAC_SHA1 = { name: 'HMAC', hash: 'SHA-1' }

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
    status: 500,
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

export const base64UrlToBase64 = (base64url: string) => {
  const padding = (4 - (base64url.length % 4)) % 4
  return base64url
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(base64url.length + padding, '=')
}

export const base64ToBase64Url = (base64: string) => {
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

export const createJwt = async (
  secret: string,
  payloadObject: Record<string, unknown>,
  options: { issuer: string, algorithm?: string },
) => {
  const header = { alg: options.algorithm ?? 'HS256', typ: 'JWT' }
  const payload = { iss: options.issuer, ...payloadObject }

  const headerBase64 = Buffer.from(JSON.stringify(header)).toString('base64')
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64')

  const signatureBase64 = await computeSignature(secret, HMAC_SHA256, `${headerBase64}.${payloadBase64}`, { encoding: 'base64' })
  const signatureBase64Url = base64ToBase64Url(signatureBase64)

  return `${headerBase64}.${payloadBase64}.${signatureBase64Url}`
}

const getJwtParts = (token: string) => {
  const parts = token.split('.')
  if (parts.length !== 3) return null

  const [header, payload, signature] = parts
  if (!header || !payload || !signature) return null

  return { header, payload, signature }
}

export const verifyJwt = async (token: string, secret: string, options: { issuer: string, algorithms: string[] }) => {
  const jwt = getJwtParts(token)
  if (!jwt) return null

  const computedSignature = await computeSignature(secret, HMAC_SHA256, `${jwt.header}.${jwt.payload}`, { encoding: 'base64' })
  if (computedSignature !== base64UrlToBase64(jwt.signature)) return null

  const decodedJwtHeader = Buffer.from(jwt.header, 'base64').toString('utf-8')
  const jsonJwtHeader: { alg: string, typ: string } = JSON.parse(decodedJwtHeader)
  if (jsonJwtHeader.typ !== 'JWT' || !options.algorithms.includes(jsonJwtHeader.alg)) return null

  const decodedJwtPayload = Buffer.from(jwt.payload, 'base64').toString('utf-8')
  const jsonJwtPayload: { iss: string, sha256: string } = JSON.parse(decodedJwtPayload)
  if (jsonJwtPayload.iss !== options.issuer) return null

  return {
    sha256: jsonJwtPayload.sha256,
  }
}

export const readRawBodyClone = async (event: H3Event): Promise<string | undefined> => {
  const hasClone = 'clone' in (event.req ?? {}) // prepare h3 v2 support
  const body = hasClone ? await (event.req as unknown as Request).clone().text() : await readRawBody(event)
  if (!hasClone) {
    (event as { _requestBody?: string })._requestBody = body
  }
  return body
}

export const readBodyClone = async <T = unknown>(event: H3Event): Promise<T | undefined> => {
  const rawBody = await readRawBodyClone(event)
  return rawBody ? JSON.parse(rawBody) as T : undefined
}
