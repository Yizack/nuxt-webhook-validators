import { defineEventHandler, createError } from 'h3'
import { isValidStripeWebhook } from './../../../../../../src/runtime/server/utils/webhooks'

export default defineEventHandler(async (event) => {
  const isValidWebhook = await isValidStripeWebhook(event)

  if (!isValidWebhook) throw createError({ statusCode: 401, message: 'Unauthorized: webhook is not valid' })

  return { isValidWebhook }
})
