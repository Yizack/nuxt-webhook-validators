export default defineEventHandler(async (event) => {
  if (event.method === 'GET') {
    const query = getQuery(event)
    return query['hub.challenge']
  }

  if (event.method !== 'POST') throw createError({ statusCode: 405, message: 'Method Not Allowed' })

  const isValidWebhook = await isValidMetaWebhook(event)

  if (!isValidWebhook) throw createError({ statusCode: 401, message: 'Unauthorized: webhook is not valid' })

  return { isValidWebhook }
})