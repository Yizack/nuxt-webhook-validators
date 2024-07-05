export default defineEventHandler(async (event) => {
  const isValidWebhook = await isValidDiscordWebhook(event)
  if (!isValidWebhook) throw createError({ statusCode: 401, message: 'Unauthorized: webhook is not valid' })
  
  const body = await readBody(event)
  
  /**
 * The PING message is used during the initial webhook handshake, and is
   required to configure the webhook in the developer portal.
  */
  if (body.type === 1) return { type: body.type } // PING

  return { isValidWebhook }
})
