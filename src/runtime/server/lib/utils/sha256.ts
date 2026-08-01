import { subtle } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { HMAC_SHA256 } from './algorithms'
import { encoder } from './signatures'

export const sha256 = async (payload: string | object, encoding?: BufferEncoding) => {
  const buffer = typeof payload === 'object' ? Buffer.from(JSON.stringify(payload)) : encoder.encode(payload)
  const signatureBuffer = await subtle.digest(HMAC_SHA256.hash, buffer)
  return Buffer.from(signatureBuffer).toString(encoding ?? 'hex')
}

export const validateSha256 = async (
  hash: string,
  payload: string,
  options?: Partial<{
    encoding: BufferEncoding
  }>,
) => {
  return hash === await sha256(payload, options?.encoding)
}
