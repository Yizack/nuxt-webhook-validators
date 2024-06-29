import { defineEventHandler, createError } from 'h3'
import { isValidPaypalWebhook } from './../../../../../../src/runtime/server/utils/webhooks'

export default defineEventHandler(async (event) => {
  const isValidWebhook = await isValidPaypalWebhook(event)

  if (!isValidWebhook) throw createError({ statusCode: 401, message: 'Unauthorized: webhook is not valid' })

  return { isValidWebhook }
})
