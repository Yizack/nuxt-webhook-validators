export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  console.log(body)

  const isValidWebhook = await isValidDiscordWebhook(event)
  if (!isValidWebhook) throw createError({ statusCode: 401, message: 'Unauthorized: webhook is not valid' })

  return { isValidWebhook }
})
