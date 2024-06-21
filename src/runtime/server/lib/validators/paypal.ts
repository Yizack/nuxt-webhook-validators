import { type H3Event, getHeaders, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'

const baseAPI = import.meta.dev ? 'https://api-m.sandbox.paypal.com/v1' : 'https://api-m.paypal.com/v1'

/**
 * Validates Paypal webhooks on the Edge \
 * Inspired by: https://developer.paypal.com/docs/api/webhooks/v1/#verify-webhook-signature_post
 * @async
 * @param event H3Event
 * @returns {boolean} `true` if the webhook is valid, `false` otherwise
 */
export const isValidPaypalWebhook = async (event: H3Event): Promise<boolean> => {
  const headers = getHeaders(event)
  const body = await readBody(event)

  if (!body || !headers) return false

  const { clientId, secretKey, webhookId } = useRuntimeConfig(event).webhooks.paypal
  const basicAuth = btoa(`${clientId}:${secretKey}`)
  const endpoint = `${baseAPI}/notifications/verify-webhook-signature`

  const response = await $fetch<{ verification_status: string }>(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basicAuth}`,
    },
    body: {
      auth_algo: headers['paypal-auth-algo'],
      cert_url: headers['paypal-cert-url'],
      transmission_id: headers['paypal-transmission-id'],
      transmission_sig: headers['paypal-transmission-sig'],
      transmission_time: headers['paypal-transmission-time'],
      webhook_id: webhookId,
      webhook_event: body,
    },
  }).catch(() => null)

  if (!response) return false

  return response.verification_status === 'SUCCESS'
}
