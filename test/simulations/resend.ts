import nuxtConfig from '../fixtures/basic/nuxt.config'
import { simulateSvixEvent } from './svix'

const secretKey = nuxtConfig.runtimeConfig?.webhook?.resend?.secretKey

export const simulateResendEvent = () => simulateSvixEvent(secretKey)
