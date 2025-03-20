import { generateKeyPairSync } from 'node:crypto'
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const keysDir = fileURLToPath(new URL('./fixtures/basic/test-keys.json', import.meta.url))

export const generateTestingKeys = async () => {
  const rsaKeys = generateKeyPairSync('rsa', {
    modulusLength: 512,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  })

  const ed25519Keys = generateKeyPairSync('ed25519', {
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  })

  await writeFile(keysDir, JSON.stringify({
    rsaKeys,
    ed25519Keys,
  }))
}
