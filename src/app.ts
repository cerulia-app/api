import { Hono } from 'hono'
import {
  createAnonymousAuthContext,
  type AuthContext,
  type AuthResolver,
} from './auth.js'
import { toErrorResponse } from './errors.js'
import { MemoryRecordStore } from './store/memory.js'
import type { RecordStore } from './store/types.js'

export interface ApiAppBindings {
  Variables: {
    auth: AuthContext
    store: RecordStore
  }
}

export interface ApiAppOptions {
  store?: RecordStore
  authResolver?: AuthResolver
}

export function createApiApp(options: ApiAppOptions = {}) {
  const app = new Hono<ApiAppBindings>()
  const store = options.store ?? new MemoryRecordStore()
  const authResolver = options.authResolver ?? (() => createAnonymousAuthContext())

  app.use('*', async (context, next) => {
    context.set('auth', authResolver(context.req.raw))
    context.set('store', store)

    try {
      await next()
    } catch (error) {
      return toErrorResponse(error)
    }
  })

  app.get('/_health', (context) => {
    return context.json({ status: 'ok' })
  })

  return app
}