import { subtle } from 'node:crypto'
import { type H3Event, getRequestHeaders, readRawBody } from 'h3'
import { verifyPublicSignature, HMAC_SHA256, ED25519, stripPemHeaders, encoder } from '../helpers'
import { useRuntimeConfig } from '#imports'

const MAILCHANNELS_CONTENT_DIGEST = 'content-digest'
const MAILCHANNELS_SIGNATURE = 'signature'
const MAILCHANNELS_SIGNATURE_INPUT = 'signature-input'
const DEFAULT_TOLERANCE = 300 // 5 minutes

const validateContentDigest = async (header?: string, body?: string) => {
  if (!header) return false

  const match = header.match(/^(.*?)=:(.*?):$/)
  if (!match) return false

  const [, algorithm, providedDigest] = match

  const normalizedAlgorithm = algorithm.replace('-', '').toLowerCase()
  if (!['sha256'].includes(normalizedAlgorithm)) return false

  const bodyBuffer = encoder.encode(body)
  const hashBuffer = await subtle.digest(HMAC_SHA256.hash, bodyBuffer)
  const hash = Buffer.from(hashBuffer).toString('base64')

  return hash === providedDigest
}

const extractSignature = (signatureHeader: string): string | null => {
  const signatureMatch = signatureHeader.match(/sig_\d+=:([^:]+):/)
  return signatureMatch ? signatureMatch[1] : null
}

const extractInputValues = (header: string) => {
  const regex = /^(\w+)=\(([^)]+)\);created=(\d+);alg="([^"]+)";keyid="([^"]+)"$/
  const match = header.match(regex)

  if (!match) return null

  return {
    name: match[1],
    timestamp: Number.parseInt(match[3], 10),
    algorithm: match[4],
    keyId: match[5],
  }
}

/**
 * Validates MailChannels webhooks on the Edge
 * @see {@link https://docs.mailchannels.net/email-api/advanced/delivery-events/#verifying-message-signatures}
 * @param event H3Event
 * @returns {boolean} `true` if the webhook is valid, `false` otherwise
 */
export const isValidMailChannelsWebhook = async (event: H3Event): Promise<boolean> => {
  // const config = ensureConfiguration('mailchannels', event) // No need to ensure mailchannels configuration
  const config = useRuntimeConfig(event).webhook.mailchannels

  const headers = getRequestHeaders(event)
  const body = await readRawBody(event)

  const contentDigest = headers[MAILCHANNELS_CONTENT_DIGEST]
  const messageSignature = headers[MAILCHANNELS_SIGNATURE]
  const signatureInput = headers[MAILCHANNELS_SIGNATURE_INPUT]

  if (!body || !contentDigest || !messageSignature || !signatureInput) return false

  if (!(await validateContentDigest(contentDigest, body))) return false

  const signature = extractSignature(messageSignature)
  if (!signature) return false

  const values = extractInputValues(signatureInput)
  if (!values) return false

  // Validate the timestamp to ensure the request isn't too old
  const now = Math.floor(Date.now() / 1000)
  if (now - values.timestamp > DEFAULT_TOLERANCE) return false

  const signingString = `"content-digest": ${contentDigest}
"@signature-params": ("content-digest");created=${values.timestamp};alg="${values.algorithm}";keyid="${values.keyId}"`

  let publicKey = config.publicKey
  if (!publicKey) {
    const publicKeyResponse = await $fetch<{ id: string, key: string }>('/tx/v1/webhook/public-key', {
      baseURL: 'https://api.mailchannels.net',
      query: { id: values.keyId },
    }).catch(() => null)
    if (!publicKeyResponse) return false
    publicKey = publicKeyResponse.key
  }
  publicKey = stripPemHeaders(publicKey)

  const isValid = await verifyPublicSignature(publicKey, ED25519, signingString, signature, {
    encoding: 'base64',
    format: 'spki',
  })

  return isValid
}
