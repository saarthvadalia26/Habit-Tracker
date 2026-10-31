import 'server-only';
import { REQUEST_CONSTANTS } from './constants';

/**
 * Generate a unique request ID for tracking and debugging
 * @returns A random alphanumeric request ID
 */
export function generateRequestId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';

  for (let i = 0; i < REQUEST_CONSTANTS.REQUEST_ID_LENGTH; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return id;
}

/**
 * Enhanced error logger with request context
 */
export function logError(error: unknown, context: {
  requestId?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}): void {
  const timestamp = new Date().toISOString();
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  // In production, this would send to a logging service (Sentry, DataDog, etc.)
  console.error({
    timestamp,
    requestId: context.requestId || 'unknown',
    action: context.action || 'unknown',
    userId: context.userId || 'anonymous',
    error: errorMessage,
    stack: errorStack,
    metadata: context.metadata,
  });

  // TODO: In production, integrate with:
  // - Sentry: Sentry.captureException(error, { contexts: { custom: context } })
  // - DataDog: logger.error(errorMessage, context)
  // - CloudWatch: cloudwatch.putLogEvents(...)
}

/**
 * Log successful operations for audit trail
 */
export function logAudit(event: {
  requestId?: string;
  action: string;
  userId: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
}): void {
  const timestamp = new Date().toISOString();

  // In production, send to audit logging service
  console.log({
    type: 'audit',
    timestamp,
    requestId: event.requestId || 'unknown',
    action: event.action,
    userId: event.userId,
    resourceType: event.resourceType,
    resourceId: event.resourceId,
    metadata: event.metadata,
  });
}

/**
 * Create a consistent error response format
 */
export function createErrorResponse(
  message: string,
  requestId?: string
): { data: null; error: string; requestId?: string } {
  return {
    data: null,
    error: message,
    ...(requestId && { requestId }),
  };
}

/**
 * Create a consistent success response format
 */
export function createSuccessResponse<T>(
  data: T,
  requestId?: string
): { data: T; error: null; requestId?: string } {
  return {
    data,
    error: null,
    ...(requestId && { requestId }),
  };
}
