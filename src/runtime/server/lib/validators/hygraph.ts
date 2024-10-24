import { type H3Event, getRequestHeaders, readRawBody } from 'h3'
import { computeSignature, HMAC_SHA256 } from '../helpers'
import { useRuntimeConfig } from '#imports'

const DEFAULT_TOLERANCE = 300 // 5 minutes tolerance
const HYGRAPH_SIGNATURE = 'gcms-signature'

function validateSignatureParts(input: string): boolean {
  // This regex looks for three parts:
  // 1. sign=<any characters including =, followed by a comma>
  // 2. env=<any characters except comma, followed by a comma>
  // 3. t=<any characters except comma>
  const regex = /^sign=[^,]+=,\s*env=[^,]+,\s*t=[^,]+$/
  return regex.test(input)
}

/**
 * Validates Hygraph webhooks on the Edge
 * @see {@link https://hygraph.com/docs/api-reference/basics/webhooks#manual-verification}
 * @param event H3Event
 * @returns {boolean} `true` if the webhook is valid, `false` otherwise
 */
export const isValidHygraphWebhook = async (event: H3Event): Promise<boolean> => {
  const headers = getRequestHeaders(event)
  const body = await readRawBody(event)
  const { secretKey } = useRuntimeConfig(event).webhook.hygraph
  const hygraphSignature = headers[HYGRAPH_SIGNATURE]

  if (!body || !hygraphSignature || !validateSignatureParts(hygraphSignature)) return false

  const [rawSign, rawEnv, rawTimestamp] = hygraphSignature.split(', ')

  const webhookSignature = rawSign.replace('sign=', '')
  const webhookEnvironmentName = rawEnv.replace('env=', '')
  const webhookTimestamp = Number.parseInt(rawTimestamp.replace('t=', ''))

  // Validate the timestamp to ensure the request isn't too old, which helps prevent replay attacks
  const now = Math.floor(Date.now() / 1000)
  if (now - webhookTimestamp > DEFAULT_TOLERANCE) return false

  const payload = JSON.stringify({
    Body: JSON.stringify(body),
    EnvironmentName: webhookEnvironmentName,
    TimeStamp: webhookTimestamp,
  })

  const computedHash = await computeSignature(secretKey, HMAC_SHA256, payload, { encoding: 'base64' })

  return computedHash === webhookSignature
}
