import { defineEventHandler, createError } from 'h3'
import { isValidTwitchWebhook } from './../../../../../../src/runtime/server/utils/webhooks'

export default defineEventHandler(async (event) => {
  const isValidWebhook = await isValidTwitchWebhook(event)

  if (!isValidWebhook) throw createError({ statusCode: 401, message: 'Unauthorized: webhook is not valid' })

  return { isValidWebhook }
})
