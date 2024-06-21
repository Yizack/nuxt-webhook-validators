import { isValidPaddleWebhook } from '../lib/validators/paddle'
import { isValidPaypalWebhook } from '../lib/validators/paypal'
import { isValidTwitchWebhook } from '../lib/validators/twitch'

export const webhooks = {
  isValidPaddleWebhook,
  isValidPaypalWebhook,
  isValidTwitchWebhook,
}
