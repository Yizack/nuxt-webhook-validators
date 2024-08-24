import { subtle } from 'node:crypto'
import { Buffer } from 'node:buffer'

export const encoder = new TextEncoder()
export const hmacAlgorithm = { name: 'HMAC', hash: 'SHA-256' }
export const ed25519Algorithm = { name: 'Ed25519', namedCurve: 'Ed25519' }

export const computeSignature = async (
  secretKey: string,
  algorithm: typeof hmacAlgorithm | typeof ed25519Algorithm,
  payload: string,
  options?: Partial<{ extractable: boolean, encoding: BufferEncoding }>,
) => {
  const key = await subtle.importKey('raw', encoder.encode(secretKey), algorithm, options?.extractable ?? false, ['sign'])
  const signature = await subtle.sign(algorithm.name, key, encoder.encode(payload))
  return Buffer.from(signature).toString(options?.encoding ?? 'hex')
}

export const verifyPublicSignature = async (
  publicKey: string,
  algorithm: typeof hmacAlgorithm | typeof ed25519Algorithm,
  payload: string,
  signature: string,
  options?: Partial<{ extractable: boolean, encoding: BufferEncoding }>,
) => {
  const publicKeyBuffer = Buffer.from(publicKey, 'hex')
  const webhookSignatureBuffer = Buffer.from(signature, 'hex')
  const key = await subtle.importKey('raw', publicKeyBuffer, algorithm, options?.extractable ?? false, ['verify'])
  const result = await subtle.verify(algorithm.name, key, webhookSignatureBuffer, encoder.encode(payload))
  return result
}
