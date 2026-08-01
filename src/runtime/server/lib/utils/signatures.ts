import { subtle, type webcrypto } from 'node:crypto'

export const encoder = new TextEncoder()

export const computeSignature = async (
  secretKey: string,
  algorithm: webcrypto.Algorithm,
  payload: string,
  options?: Partial<{
    extractable: boolean
    encoding: BufferEncoding
    decodeKey: boolean
  }>,
) => {
  const encoding = options?.encoding ?? 'hex'
  const secretKeyBuffer = options?.decodeKey ? Buffer.from(secretKey, encoding) : encoder.encode(secretKey)

  const key = await subtle.importKey('raw', secretKeyBuffer, algorithm, Boolean(options?.extractable), ['sign'])
  const signature = await subtle.sign(algorithm.name, key, encoder.encode(payload))
  return Buffer.from(signature).toString(encoding)
}

export const verifyPublicSignature = async (
  publicKey: string,
  algorithm: webcrypto.Algorithm,
  payload: string,
  signature: string,
  options?: Partial<{
    extractable: boolean
    encoding: BufferEncoding
    format: Exclude<webcrypto.KeyFormat, 'jwk'>
  }>,
) => {
  const encoding = options?.encoding ?? 'hex'
  const format = options?.format ?? 'raw'

  const publicKeyBuffer = Buffer.from(publicKey, encoding)
  const webhookSignatureBuffer = Buffer.from(signature, encoding)

  const key = await subtle.importKey(format, publicKeyBuffer, algorithm, Boolean(options?.extractable), ['verify'])
  const result = await subtle.verify(algorithm.name, key, webhookSignatureBuffer, encoder.encode(payload))
  return result
}
