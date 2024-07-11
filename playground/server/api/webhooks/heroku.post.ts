export default defineEventHandler(async (event) => {
  const isValidWebhook = await isValidHerokuWebhook(event)

  if (!isValidWebhook) throw createError({ statusCode: 401, message: 'Unauthorized: webhook is not valid' })

  return { isValidWebhook }
})
