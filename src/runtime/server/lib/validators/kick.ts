import { type H3Event, getRequestHeaders, readRawBody } from 'h3'
import { verifyPublicSignature, RSASSA_PKCS1_v1_5_SHA256, stripPemHeaders } from '../helpers'
import { useRuntimeConfig } from '#imports'

const KICK_MESSAGE_ID = 'Kick-Event-Message-Id'.toLowerCase()
const KICK_MESSAGE_TIMESTAMP = 'Kick-Event-Message-Timestamp'.toLowerCase()
const KICK_MESSAGE_SIGNATURE = 'Kick-Event-Signature'.toLowerCase()

const KICK_PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAq/+l1WnlRrGSolDMA+A8
6rAhMbQGmQ2SapVcGM3zq8ANXjnhDWocMqfWcTd95btDydITa10kDvHzw9WQOqp2
MZI7ZyrfzJuz5nhTPCiJwTwnEtWft7nV14BYRDHvlfqPUaZ+1KR4OCaO/wWIk/rQ
L/TjY0M70gse8rlBkbo2a8rKhu69RQTRsoaf4DVhDPEeSeI5jVrRDGAMGL3cGuyY
6CLKGdjVEM78g3JfYOvDU/RvfqD7L89TZ3iN94jrmWdGz34JNlEI5hqK8dd7C5EF
BEbZ5jgB8s8ReQV8H+MkuffjdAj3ajDDX3DOJMIut1lBrUVD1AaSrGCKHooWoL2e
twIDAQAB
-----END PUBLIC KEY-----`

/**
 * Validates Kick webhooks on the Edge
 * @see {@link https://docs.kick.com/events/webhook-security#webhook-sender-validation}
 * @param event H3Event
 * @returns {boolean} `true` if the webhook is valid, `false` otherwise
 */
export const isValidKickWebhook = async (event: H3Event): Promise<boolean> => {
  // const config = ensureConfiguration('kick', event) // No need to ensure kick configuration
  const config = useRuntimeConfig(event).webhook.kick

  const headers = getRequestHeaders(event)
  const body = await readRawBody(event)

  const messageId = headers[KICK_MESSAGE_ID]
  const messageTimestamp = headers[KICK_MESSAGE_TIMESTAMP]
  const messageSignature = headers[KICK_MESSAGE_SIGNATURE]

  if (!body || !messageId || !messageTimestamp || !messageSignature) return false

  const payload = `${messageId}.${messageTimestamp}.${body}`
  const publicKey = stripPemHeaders(config.publicKey || KICK_PUBLIC_KEY_PEM)

  const isValid = await verifyPublicSignature(publicKey, RSASSA_PKCS1_v1_5_SHA256, payload, messageSignature, {
    encoding: 'base64',
    format: 'spki',
  })
  return isValid
}
