import { NextResponse } from 'next/server'
import logger from './logger'

/**
 * Custom API Error class for consistent error handling
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }

  static badRequest(message: string, code?: string) {
    return new ApiError(400, message, code || 'BAD_REQUEST')
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message, 'UNAUTHORIZED')
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message, 'FORBIDDEN')
  }

  static notFound(message = 'Not found') {
    return new ApiError(404, message, 'NOT_FOUND')
  }

  static conflict(message: string, code?: string) {
    return new ApiError(409, message, code || 'CONFLICT')
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message, 'INTERNAL_ERROR')
  }
}

/**
 * Error response interface
 */
interface ErrorResponse {
  error: {
    message: string
    code?: string
    statusCode: number
  }
}

/**
 * Handle API errors and return consistent JSON responses
 */
export function handleApiError(
  error: unknown,
  context: string
): NextResponse<ErrorResponse> {
  // Handle known API errors
  if (error instanceof ApiError) {
    logger.error(context, error, { statusCode: error.statusCode, code: error.code })
    return NextResponse.json(
      {
        error: {
          message: error.message,
          code: error.code,
          statusCode: error.statusCode,
        },
      },
      { status: error.statusCode }
    )
  }

  // Handle unknown errors
  const message = error instanceof Error ? error.message : 'An unexpected error occurred'
  logger.error(context, error)

  return NextResponse.json(
    {
      error: {
        message: process.env.NODE_ENV === 'development' ? message : 'Internal server error',
        code: 'INTERNAL_ERROR',
        statusCode: 500,
      },
    },
    { status: 500 }
  )
}

/**
 * Wrapper for API route handlers with automatic error handling
 */
export function withErrorHandler<T>(
  context: string,
  handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T | ErrorResponse>> {
  return handler().catch((error) => handleApiError(error, context))
}
