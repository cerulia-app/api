import { ValidationError } from '@atproto/lexicon'

export type ApiErrorCode =
  | 'InvalidRequest'
  | 'Unauthorized'
  | 'Forbidden'
  | 'NotFound'
  | 'InternalError'

export class ApiError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    message: string,
    public readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function toErrorResponse(error: unknown): Response {
  if (error instanceof ValidationError) {
    return Response.json(
      {
        error: 'InvalidRequest',
        message: error.message,
      },
      {
        status: 400,
      },
    )
  }

  if (error instanceof ApiError) {
    return Response.json(
      {
        error: error.code,
        message: error.message,
      },
      {
        status: error.status,
      },
    )
  }

  return Response.json(
    {
      error: 'InternalError',
      message: 'Unexpected service error',
    },
    {
      status: 500,
    },
  )
}