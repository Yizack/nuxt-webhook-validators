import { HMAC_SHA256 } from './algorithms'
import { base64ToBase64Url, base64UrlToBase64 } from './base64'
import { computeSignature } from './signatures'

export const createJwt = async (
  secret: string,
  payloadObject: Record<string, unknown>,
  options: { issuer: string, algorithm?: string },
) => {
  const header = { alg: options.algorithm ?? 'HS256', typ: 'JWT' }
  const payload = { iss: options.issuer, ...payloadObject }

  const headerBase64 = Buffer.from(JSON.stringify(header)).toString('base64')
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64')

  const signatureBase64 = await computeSignature(secret, HMAC_SHA256, `${headerBase64}.${payloadBase64}`, { encoding: 'base64' })
  const signatureBase64Url = base64ToBase64Url(signatureBase64)

  return `${headerBase64}.${payloadBase64}.${signatureBase64Url}`
}

const getJwtParts = (token: string) => {
  const parts = token.split('.')
  if (parts.length !== 3) return null

  const [header, payload, signature] = parts
  if (!header || !payload || !signature) return null

  return { header, payload, signature }
}

export const verifyJwt = async (token: string, secret: string, options: { issuer: string, algorithms: string[] }) => {
  const jwt = getJwtParts(token)
  if (!jwt) return null

  const computedSignature = await computeSignature(secret, HMAC_SHA256, `${jwt.header}.${jwt.payload}`, { encoding: 'base64' })
  if (computedSignature !== base64UrlToBase64(jwt.signature)) return null

  const decodedJwtHeader = Buffer.from(jwt.header, 'base64').toString('utf-8')
  const jsonJwtHeader: { alg: string, typ: string } = JSON.parse(decodedJwtHeader)
  if (jsonJwtHeader.typ !== 'JWT' || !options.algorithms.includes(jsonJwtHeader.alg)) return null

  const decodedJwtPayload = Buffer.from(jwt.payload, 'base64').toString('utf-8')
  const jsonJwtPayload: { iss: string, sha256: string } = JSON.parse(decodedJwtPayload)
  if (jsonJwtPayload.iss !== options.issuer) return null

  return {
    sha256: jsonJwtPayload.sha256,
  }
}
