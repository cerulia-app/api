import { describe, expect, test } from 'bun:test'
import { createApiApp } from './app.js'
import { ApiError } from './errors.js'
import { paginate } from './pagination.js'
import { parseAtUri } from './refs.js'

describe('createApiApp', () => {
  test('returns a health response', async () => {
    const app = createApiApp()
    const response = await app.request('/_health')

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ status: 'ok' })
  })

  test('rejects malformed AT URIs', () => {
    expect(() => parseAtUri('at://not-a-did/app.cerulia.core.session/test')).toThrow(ApiError)
    expect(() => parseAtUri('at://did:plc:alice/not a nsid/test')).toThrow(ApiError)
    expect(() => parseAtUri('at://did:plc:alice/app.cerulia.core.session/with/slash')).toThrow(ApiError)
  })

  test('rejects malformed pagination input', () => {
    expect(() => paginate([1, 2, 3], '10abc', undefined)).toThrow(ApiError)
    expect(() => paginate([1, 2, 3], undefined, '2x')).toThrow(ApiError)
  })
})