export const base64UrlToBase64 = (base64url: string) => {
  const padding = (4 - (base64url.length % 4)) % 4
  return base64url
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(base64url.length + padding, '=')
}

export const base64ToBase64Url = (base64: string) => {
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}
