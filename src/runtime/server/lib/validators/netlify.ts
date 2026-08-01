import { type H3Event, getRequestHeaders } from 'h3'
import { ensureConfiguration, readRawBodyClone, validateSha256, verifyJwt } from '../helpers'

const NETLIFY_SIGNATURE = 'X-Webhook-Signature'.toLowerCase()
const ISSUER = 'netlify'
const ALGORITHM = 'HS256'

/**
 * Validates Netlify webhooks on the Edge
 * @see {@link https://docs.netlify.com/deploy/deploy-notifications/#payload-signature}
 * @param event H3Event
 * @returns {boolean} `true` if the webhook is valid, `false` otherwise
 */
export const isValidNetlifyWebhook = async (event: H3Event): Promise<boolean> => {
  const config = ensureConfiguration('netlify', event)

  const headers = getRequestHeaders(event)
  const body = await readRawBodyClone(event)

  const header = headers[NETLIFY_SIGNATURE]

  if (!body || !header) return false

  const decoded = await verifyJwt(header, config.secretKey, { issuer: ISSUER, algorithms: [ALGORITHM] })
  if (!decoded) return false

  return validateSha256(decoded.sha256, body)
}
