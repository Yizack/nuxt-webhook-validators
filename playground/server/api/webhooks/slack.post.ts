export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (body.challenge) {
    return body.challenge
  }

  const isValidWebhook = await isValidSlackWebhook(event)

  if (!isValidWebhook) throw createError({ statusCode: 401, message: 'Unauthorized: webhook is not valid' })

  return { isValidWebhook }
})
