export default defineEventHandler(async (event) => {
  const isValidWebhook = await isValidPolarWebhook(event)

  if (!isValidWebhook) throw createError({ statusCode: 401, message: 'Unauthorized: webhook is not valid' })

  return { isValidWebhook }
})
