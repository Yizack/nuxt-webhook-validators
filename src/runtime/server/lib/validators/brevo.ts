import { type H3Event, getRequestHeader, getRequestIP } from 'h3'
import { useRuntimeConfig } from '#imports'

const ALLOWED_IP_RANGES = ['1.179.112.0/20', '172.246.240.0/20']

const ipToInt = (ip: string) => {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + Number(octet), 0)
}

const isIpInRange = (ip: string, cidr: string) => {
  const [range, bits] = cidr.split('/')
  if (!range || !bits) return false

  const mask = ~(2 ** (32 - Number(bits)) - 1)
  return (ipToInt(ip) & mask) === (ipToInt(range) & mask)
}

/**
 * Validates Brevo webhooks on the Edge
 * @see {@link https://help.brevo.com/hc/en-us/articles/27824932835474}
 * @param event H3Event
 * @returns {boolean} `true` if the webhook is valid, `false` otherwise
 */
export const isValidBrevoWebhook = async (event: H3Event): Promise<boolean> => {
  const ip = getRequestIP(event, { xForwardedFor: true })

  if (!ip || !ALLOWED_IP_RANGES.some(cidr => isIpInRange(ip, cidr))) return false

  // const config = ensureConfiguration('brevo', event) // No need to ensure brevo configuration
  const config = useRuntimeConfig(event).webhook.brevo

  if (config.token) {
    const authorization = getRequestHeader(event, 'authorization') || ''
    if (!authorization.toLowerCase().startsWith('bearer ')) return false
    const token = authorization.slice(7)
    if (token !== config.token) return false
  }

  return true
}
