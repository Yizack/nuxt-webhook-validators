import { type H3Event, getRequestHeaders, readRawBody } from 'h3'
import { computeSignature, HMAC_SHA256, ensureConfiguration } from '../helpers'
import { useRuntimeConfig } from '#imports'

const DEFAULT_TOLERANCE = 300 // 5 minutes tolerance
const HYGRAPH_SIGNATURE = 'gcms-signature'

interface ParsedSignature {
  sign: string
  env: string
  timestamp: number
}

function parseSignature(signature: string): ParsedSignature | null {
  const parts = signature.split(', ')
  if (parts.length !== 3) return null

  const parsed: Partial<ParsedSignature> = {}
  for (const part of parts) {
    const [key, ...valueParts] = part.split('=')
    const value = valueParts.join('=') // Rejoin in case there are multiple '=' in the value

    if (key === 'sign') parsed.sign = value
    else if (key === 'env') parsed.env = value
    else if (key === 't') parsed.timestamp = Number.parseInt(value, 10)
  }

  if (!parsed.sign || !parsed.env || !parsed.timestamp) return null
  return parsed as ParsedSignature
}

/**
 * Validates Hygraph webhooks on the Edge
 * @see {@link https://hygraph.com/docs/api-reference/basics/webhooks#manual-verification}
 * @param event H3Event
 * @returns {boolean} `true` if the webhook is valid, `false` otherwise
 */
export const isValidHygraphWebhook = async (event: H3Event): Promise<boolean> => {
  const config = useRuntimeConfig(event).webhook.hygraph
  ensureConfiguration(config, 'hygraph')

  const headers = getRequestHeaders(event)
  const body = await readRawBody(event)

  const hygraphSignature = headers[HYGRAPH_SIGNATURE]

  if (!body || !hygraphSignature) return false

  const parsedSignature = parseSignature(hygraphSignature)
  if (!parsedSignature) return false

  const { sign: webhookSignature, env: webhookEnvironmentName, timestamp: webhookTimestamp } = parsedSignature

  // Validate the timestamp to ensure the request isn't too old
  const now = Math.floor(Date.now() / 1000)
  if (now - webhookTimestamp > DEFAULT_TOLERANCE) return false

  const payload = JSON.stringify({
    Body: body,
    EnvironmentName: webhookEnvironmentName,
    TimeStamp: webhookTimestamp,
  })

  const computedHash = await computeSignature(config.secretKey, HMAC_SHA256, payload, { encoding: 'base64' })

  return computedHash === webhookSignature
}
