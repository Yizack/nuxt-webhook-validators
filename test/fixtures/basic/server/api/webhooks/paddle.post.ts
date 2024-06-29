import { defineEventHandler, createError } from 'h3'
import { isValidPaddleWebhook } from './../../../../../../src/runtime/server/utils/webhooks'

export default defineEventHandler(async (event) => {
  const isValidWebhook = await isValidPaddleWebhook(event)

  if (!isValidWebhook) throw createError({ statusCode: 401, statusMessage: 'Unauthorized: webhook is not valid' })

  return { isValidWebhook }
})
