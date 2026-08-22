import { type H3Event, getRequestHeaders } from 'h3'
import { computeSignature, HMAC_SHA256, ensureConfiguration, readRawBodyClone, verifyBasicAuth } from '../utils'

const DOCUSIGN_SIGNATURE_PREFIX = 'X-Docusign-Signature-'.toLowerCase()
const DOCUSIGN_AUTHORIZATION = 'authorization'

/**
 * Validates Docusign webhooks on the Edge
 * @see {@link https://developers.docusign.com/platform/webhooks/connect/validate}
 * @param event H3Event
 * @returns {boolean} `true` if the webhook is valid, `false` otherwise
 */
export const isValidDocusignWebhook = async (event: H3Event): Promise<boolean> => {
  const config = ensureConfiguration('docusign', event, {
    matrix: [
      ['secretKey'],
      ['username', 'password'],
    ],
  })

  const headers = getRequestHeaders(event)
  const body = await readRawBodyClone(event)

  const webhookSignatures = Object.entries(headers)
    .filter(([key]) => {
      const k = key.toLowerCase()
      return k.startsWith(DOCUSIGN_SIGNATURE_PREFIX) && /^\d+$/.test(k.slice(DOCUSIGN_SIGNATURE_PREFIX.length))
    })
    .map(([, value]) => value)

  const basicAuth = headers[DOCUSIGN_AUTHORIZATION]

  if (!(basicAuth && config.username && config.password) && !config.secretKey) return false

  if (basicAuth && config.username && config.password
    && !verifyBasicAuth(basicAuth, config.username, config.password)
  ) return false

  if (config.secretKey) {
    if (!body || !webhookSignatures?.length) return false
    const computedHash = await computeSignature(config.secretKey, HMAC_SHA256, body, { encoding: 'base64' })
    if (!webhookSignatures.includes(computedHash)) return false
  }

  return true
}
