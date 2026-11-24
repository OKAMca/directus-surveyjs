import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import endpoint from '../src/survey-api/index'

type Handler = (req: any, res: any) => unknown

class ForbiddenError extends Error {
  status = 403
  code = 'FORBIDDEN'
  extensions = { reason: 'internal detail' }
}

// Behaves like an Express response: a second send throws ERR_HTTP_HEADERS_SENT.
const createResponse = () => {
  const sent: { status: number, body: unknown }[] = []
  let statusCode = 200
  const res = {
    get headersSent() {
      return sent.length > 0
    },
    status(code: number) {
      statusCode = code
      return res
    },
    json(body: unknown) {
      if (sent.length > 0) {
        throw Object.assign(new Error('Cannot set headers after they are sent to the client'), { code: 'ERR_HTTP_HEADERS_SENT' })
      }
      sent.push({ status: statusCode, body })
      return res
    },
  }
  return { res, sent }
}

const mountRoutes = (ItemsService: unknown, getSchema = async () => ({})) => {
  const routes = new Map<string, Handler>()
  const router = {
    post: (path: string, handler: Handler) => routes.set(`POST ${path}`, handler),
    patch: (path: string, handler: Handler) => routes.set(`PATCH ${path}`, handler),
  }
  const logger = { error: vi.fn(), warn: vi.fn(), info: vi.fn() }
  const register = endpoint as unknown as (router: unknown, context: unknown) => void
  register(router, { services: { ItemsService }, getSchema, logger })
  return { routes, logger }
}

// Every read and write is denied, as for an anonymous user without permissions.
class DeniedItemsService {
  async readByQuery() { throw new ForbiddenError('denied') }
  async readOne() { throw new ForbiddenError('denied') }
  async createOne() { throw new ForbiddenError('denied') }
  async updateOne() { throw new ForbiddenError('denied') }
}

const unhandled: unknown[] = []
const onUnhandled = (reason: unknown) => unhandled.push(reason)

beforeEach(() => {
  unhandled.length = 0
  process.on('unhandledRejection', onUnhandled)
})

afterEach(() => {
  process.off('unhandledRejection', onUnhandled)
})

const call = async (routes: Map<string, Handler>, route: string, req: Record<string, unknown>) => {
  const handler = routes.get(route)
  if (!handler) throw new Error(`Route ${route} is not registered`)
  const { res, sent } = createResponse()
  await handler({ accountability: null, ...req }, res)
  // Let any stray rejection surface before asserting.
  await new Promise((resolve) => setTimeout(resolve, 10))
  return sent
}

describe('survey-api when the settings cannot be read', () => {
  it('answers an anonymous form submission once and does not reject', async () => {
    const { routes } = mountRoutes(DeniedItemsService)

    const sent = await call(routes, 'POST /form-submission/:formConfigId', {
      params: { formConfigId: '999999' },
      body: { data: {} },
    })

    expect(sent).toHaveLength(1)
    expect(sent[0]?.status).toBe(403)
    expect(unhandled).toEqual([])
  })

  it.each([
    ['PATCH /form-config-update/:formConfigId', { params: { formConfigId: '1' }, body: {} }],
    ['POST /form-config-create', { params: {}, body: {} }],
  ])('answers %s once and does not reject', async (route, req) => {
    const { routes } = mountRoutes(DeniedItemsService)

    const sent = await call(routes, route, req)

    expect(sent).toHaveLength(1)
    expect(sent[0]?.status).toBe(403)
    expect(unhandled).toEqual([])
  })

  it('does not put the raw error into the response', async () => {
    const { routes } = mountRoutes(DeniedItemsService)

    const sent = await call(routes, 'POST /form-submission/:formConfigId', {
      params: { formConfigId: '1' },
      body: { data: {} },
    })

    expect(JSON.stringify(sent[0]?.body)).not.toContain('internal detail')
    expect(JSON.stringify(sent[0]?.body)).not.toContain('FORBIDDEN')
  })
})

describe('survey-api when an unexpected error is thrown', () => {
  it('answers once with a fixed message', async () => {
    class BrokenItemsService {
      async readByQuery() { return [] }
      async readOne() { throw new Error('connection terminated: password=secret') }
    }
    const { routes } = mountRoutes(BrokenItemsService)

    const sent = await call(routes, 'POST /form-submission/:formConfigId', {
      params: { formConfigId: '1' },
      body: { data: {} },
    })

    expect(sent).toHaveLength(1)
    expect(JSON.stringify(sent[0]?.body)).not.toContain('secret')
    expect(unhandled).toEqual([])
  })

  it('logs a submission schema error and resolves after sending one fixed response', async () => {
    class SubmissionItemsService {
      async readByQuery() { return [] }
      async readOne() { return { form_submission_collection: 'submissions' } }
    }
    const error = Object.assign(new Error('internal schema lookup failed'), { status: 503 })
    const getSchema = vi.fn(async () => ({}))
      .mockResolvedValueOnce({}) // Settings schema
      .mockResolvedValueOnce({}) // Form config schema
      .mockRejectedValueOnce(error)
    const { routes, logger } = mountRoutes(SubmissionItemsService, getSchema)

    const sent = await call(routes, 'POST /form-submission/:formConfigId', {
      params: { formConfigId: '1' },
      body: { data: { name: 'x' } },
    })

    expect(sent).toEqual([{ status: 503, body: { details: 'The request could not be completed.' } }])
    expect(logger.error).toHaveBeenCalledTimes(1)
    expect(logger.error).toHaveBeenCalledWith(error, '[survey-api] Unexpected error')
    expect(JSON.stringify(sent)).not.toContain(error.message)
    expect(unhandled).toEqual([])
  })
})

describe('survey-api when everything is allowed', () => {
  it('creates the submission and answers 201', async () => {
    const created: unknown[] = []
    class AllowedItemsService {
      constructor(private collection: string) {}
      async readByQuery() { return [{ form_config_collection: 'form_configs' }] }
      async readOne() { return { form_submission_collection: 'submissions' } }
      async createOne(item: unknown) {
        created.push([this.collection, item])
        return 7
      }
    }
    const { routes } = mountRoutes(AllowedItemsService)

    const sent = await call(routes, 'POST /form-submission/:formConfigId', {
      params: { formConfigId: '1' },
      body: { data: { name: 'x' } },
    })

    expect(created).toEqual([['submissions', { data: { name: 'x' } }]])
    expect(sent).toEqual([{ status: 201, body: { message: 'Survey submitted successfully', item: 7 } }])
  })
})
