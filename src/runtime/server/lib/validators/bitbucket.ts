import { type H3Event, getRequestHeaders } from 'h3'
import { computeSignature, HMAC_SHA256, ensureConfiguration, readRawBodyClone } from '../helpers'

const BITBUCKET_SIGNATURE = 'X-Hub-Signature'.toLowerCase()
const HMAC_PREFIX = 'sha256='

/**
 * Validates Bitbucket webhooks on the Edge
 * @see {@link https://support.atlassian.com/bitbucket-cloud/docs/manage-webhooks/#Validating-webhook-deliveries}
 * @param event H3Event
 * @returns {boolean} `true` if the webhook is valid, `false` otherwise
 */
export const isValidBitbucketWebhook = async (event: H3Event): Promise<boolean> => {
  const config = ensureConfiguration('bitbucket', event)

  const headers = getRequestHeaders(event)
  const body = await readRawBodyClone(event)

  const signature = headers[BITBUCKET_SIGNATURE]

  if (!signature || !body) return false

  const computedHash = await computeSignature(config.secretKey, HMAC_SHA256, body)
  return signature === `${HMAC_PREFIX}${computedHash}`
}
