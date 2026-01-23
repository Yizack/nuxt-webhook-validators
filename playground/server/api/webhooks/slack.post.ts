export default defineEventHandler(async (event) => {
  const isValidWebhook = await isValidSlackWebhook(event)

  const body = await readBody(event)

  if (body.challenge) {
    return body.challenge
  }

  if (!isValidWebhook) throw createError({ statusCode: 401, message: 'Unauthorized: webhook is not valid' })

  return { isValidWebhook }
})
