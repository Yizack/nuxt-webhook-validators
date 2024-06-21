export default defineEventHandler(async (event) => {
  const isValidWebhook = await isValidPaypalWebhook(event)

  if (!isValidWebhook) throw createError({ status: 400, message: 'Invalid webhook' })

  return { isValidWebhook }
})
