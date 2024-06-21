export default defineEventHandler(async (event) => {
  const isValidWebhook = await isValidGithubWebhook(event)

  if (!isValidWebhook) throw createError({ status: 400, message: 'Invalid webhook' })
  console.log('Received valid GitHub webhook')
  return { isValidWebhook }
})
