export default defineEventHandler(async (event) => {
  const isValidWebhook = await isValidTwitchWebhook(event)

  if (!isValidWebhook) throw createError({ statusCode: 401, message: 'Unauthorized: webhook is not valid' })

  const headers = getHeaders(event)
  const body = await readBody(event)

  const MESSAGE_TYPE = 'Twitch-Eventsub-Message-Type'.toLowerCase()
  const MESSAGE_TYPE_VERIFICATION = 'webhook_callback_verification'

  /**
   * Verify the webhook callback subscription by responding to a challenge request.
   @see https://dev.twitch.tv/docs/eventsub/handling-webhook-events#responding-to-a-challenge-request
   */
  if (headers[MESSAGE_TYPE] === MESSAGE_TYPE_VERIFICATION) return body.challenge

  return { isValidWebhook }
})
