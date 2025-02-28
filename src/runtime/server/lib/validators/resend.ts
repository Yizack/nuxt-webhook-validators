import type { H3Event } from 'h3'
import { configContext } from '../helpers'
import { isValidSvixWebhook } from './svix'

/**
 * Validates Resend webhooks on the Edge
 * @see {@link https://resend.com/docs/dashboard/webhooks/verify-webhooks-requests}
 * @param event H3Event
 * @returns {boolean} `true` if the webhook is valid, `false` otherwise
 */
export const isValidResendWebhook = async (event: H3Event): Promise<boolean> => {
  configContext.provider = 'resend'
  return isValidSvixWebhook(event)
}
