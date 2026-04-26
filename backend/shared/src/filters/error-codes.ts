// XceliQOS Error Code Registry
// Format: <DOMAIN>_<3-digit-number>
// Add new codes here — never reuse or delete existing codes.

export const ErrorCodes = {
  // Auth domain
  AUTH_001: 'AUTH_001', // Unauthorized — missing or invalid token
  AUTH_002: 'AUTH_002', // Forbidden — insufficient permissions
  AUTH_003: 'AUTH_003', // Invalid credentials
  AUTH_004: 'AUTH_004', // Token expired

  // Validation domain
  VALIDATION_001: 'VALIDATION_001', // Request body validation failed
  VALIDATION_002: 'VALIDATION_002', // Invalid UUID format
  VALIDATION_003: 'VALIDATION_003', // Missing required field

  // School domain
  SCHOOL_001: 'SCHOOL_001', // School not found
  SCHOOL_002: 'SCHOOL_002', // Academic year not found
  SCHOOL_003: 'SCHOOL_003', // Class not found
  SCHOOL_004: 'SCHOOL_004', // Student not found
  SCHOOL_005: 'SCHOOL_005', // Duplicate enrollment

  // AI domain
  AI_001: 'AI_001', // AI service unavailable
  AI_002: 'AI_002', // AI response generation failed

  // Finance domain
  FINANCE_001: 'FINANCE_001', // Ledger entry not found
  FINANCE_002: 'FINANCE_002', // Insufficient balance

  // Generic
  INTERNAL_001: 'INTERNAL_001', // Unexpected internal error
  NOT_FOUND_001: 'NOT_FOUND_001', // Resource not found
  CONFLICT_001: 'CONFLICT_001', // Resource conflict
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

export const HttpStatusToErrorCode: Record<number, ErrorCode> = {
  400: ErrorCodes.VALIDATION_001,
  401: ErrorCodes.AUTH_001,
  403: ErrorCodes.AUTH_002,
  404: ErrorCodes.NOT_FOUND_001,
  409: ErrorCodes.CONFLICT_001,
  500: ErrorCodes.INTERNAL_001,
};
