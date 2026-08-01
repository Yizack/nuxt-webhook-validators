import { type H3Event, readRawBody } from 'h3'

export const readRawBodyClone = async (event: H3Event): Promise<string | undefined> => {
  const hasClone = 'clone' in (event.req ?? {}) // prepare h3 v2 support
  const body = hasClone ? await (event.req as unknown as Request).clone().text() : await readRawBody(event)
  if (!hasClone) {
    (event as { _requestBody?: string })._requestBody = body
  }
  return body
}

export const readBodyClone = async <T = unknown>(event: H3Event): Promise<T | undefined> => {
  const rawBody = await readRawBodyClone(event)
  return rawBody ? JSON.parse(rawBody) as T : undefined
}
