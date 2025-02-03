import { $fetch } from '@nuxt/test-utils/e2e'
import nuxtConfig from '../fixtures/basic/nuxt.config'

const body = 'testBody'
const secretToken = nuxtConfig.runtimeConfig?.webhook?.gitlab?.secretToken

export const simulateGitLabEvent = async () => {
  const headers = { 'X-Gitlab-Token': secretToken! }

  return $fetch<{ isValidWebhook: boolean }>('/api/webhooks/gitlab', {
    method: 'POST',
    headers,
    body,
  })
}
