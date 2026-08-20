import { type H3Event, getRequestHeaders } from 'h3'
import { computeSignature, HMAC_SHA256, ensureConfiguration, readRawBodyClone } from '../utils'

const MUX_SIGNATURE = 'Mux-Signature'.toLowerCase()

const extractHeaders = (header: string) => {
  const parts = header.split(',')
  let t = ''
  let v1 = ''
  for (const part of parts) {
    const [key, value] = part.split('=')
    if (value) {
      if (key === 't') t = value
      else if (key === 'v1') v1 = value
    }
  }
  if (!(t && v1)) return null
  return { t: Number.parseInt(t), v1 }
}

/**
 * Validates Mux webhooks on the Edge
 * @see {@link https://www.mux.com/docs/core/verify-webhook-signatures}
 * @param event H3Event
 * @returns {boolean} `true` if the webhook is valid, `false` otherwise
 */
export const isValidMuxWebhook = async (event: H3Event): Promise<boolean> => {
  const config = ensureConfiguration('mux', event)

  const headers = getRequestHeaders(event)
  const body = await readRawBodyClone(event)

  const header = headers[MUX_SIGNATURE]

  if (!body || !header) return false

  const signatureHeaders = extractHeaders(header)
  if (!signatureHeaders) return false

  const { t: webhookTimestamp, v1: webhookSignature } = signatureHeaders

  const payload = `${webhookTimestamp}.${body}`

  const computedHash = await computeSignature(config.secretKey, HMAC_SHA256, payload)
  return computedHash === webhookSignature
}
