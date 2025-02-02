import { type H3Event, getRequestHeaders, readRawBody } from 'h3'
import { computeSignature, HMAC_SHA256, ensureConfiguration } from '../helpers'

const GITLAB_SIGNATURE = 'X-Gitlab-Token'.toLowerCase()

/**
 * Validates GitLab webhooks on the Edge
 * @see {@link https://docs.gitlab.com/ee/user/project/integrations/webhooks.html}
 * @param event H3Event
 * @returns {boolean} `true` if the webhook is valid, `false` otherwise
 */
export const isValidGitLabWebhook = async (event: H3Event): Promise<boolean> => {
  const config = ensureConfiguration('gitlab', event)

  const headers = getRequestHeaders(event)
  const body = await readRawBody(event)

  const header = headers[GITLAB_SIGNATURE]

  if (!body || !header) return false

  const parts = header.split('=')
  const webhookSignature = parts[1]

  const computedHash = await computeSignature(config.secretToken, HMAC_SHA256, body)
  return computedHash === webhookSignature
}
