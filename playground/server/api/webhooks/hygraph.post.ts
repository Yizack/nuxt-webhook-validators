export default defineEventHandler(async (event) => {
  const isValidWebhook = await isValidHygraphWebhook(event)

  if (!isValidWebhook) throw createError({ status: 401, message: 'Unauthorized: webhook is not valid' })

  return { isValidWebhook }
})
