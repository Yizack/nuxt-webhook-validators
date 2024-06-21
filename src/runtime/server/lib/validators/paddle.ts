import { subtle } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { type H3Event, getHeaders, readRawBody } from 'h3'
import { useRuntimeConfig } from '#imports'

const MAX_VALID_TIME_DIFFERENCE = 5

const extractHeaders = (header: string) => {
  const parts = header.split(';')
  let ts = ''
  let h1 = ''
  for (const part of parts) {
    const [key, value] = part.split('=')
    if (value) {
      if (key === 'ts') ts = value
      else if (key === 'h1') h1 = value
    }
  }
  if (!(ts && h1)) return null
  return { ts: Number.parseInt(ts), h1 }
}

/**
 * Validates Paddle webhooks on the Edge \
 * Inspired by: https://github.com/PaddleHQ/paddle-node-sdk/blob/main/src/notifications/helpers/webhooks-validator.ts
 * @async
 * @param event H3Event
 * @returns {boolean} `true` if the webhook is valid, `false` otherwise
 */
export const isValidPaddleWebhook = async (event: H3Event): Promise<boolean> => {
  const headers = getHeaders(event)
  const body = await readRawBody(event)
  const { webhookId } = useRuntimeConfig(event).webhooks.paddle

  const paddleSignature = headers['paddle-signature']

  if (!body || !paddleSignature) return false

  const signatureHeaders = extractHeaders(paddleSignature)
  if (!signatureHeaders) return false
  const { ts: webhookTimestamp, h1: webhookSignature } = signatureHeaders

  if (new Date().getTime() > new Date((webhookTimestamp + MAX_VALID_TIME_DIFFERENCE) * 1000).getTime()) return false

  const payloadWithTime = `${webhookTimestamp}:${body}`
  const encoder = new TextEncoder()
  const algorithm = { name: 'HMAC', hash: 'SHA-256' }

  const key = await subtle.importKey('raw', encoder.encode(webhookId), algorithm, false, ['sign'])
  const hmac = await subtle.sign(algorithm.name, key, encoder.encode(payloadWithTime))

  const computedHash = Buffer.from(hmac).toString('hex')

  return computedHash === webhookSignature
}
