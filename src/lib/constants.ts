/**
 * Application-wide constants for Habit Tracker
 * Extracted from magic numbers and hardcoded strings for maintainability
 */

// Time and Date Constants
export const TIME_CONSTANTS = {
  /** 72-hour edit window for habit logs (in days) */
  EDIT_WINDOW_DAYS: 3,
  /** Maximum days in advance to allow streak freeze deployment */
  STREAK_FREEZE_ADVANCE_DAYS: 14,
  /** Base number of streak freeze shields per habit */
  BASE_STREAK_SHIELDS: 2,
  /** Maximum streak freeze shields per habit */
  MAX_STREAK_SHIELDS: 5,
  /** Days of continuous streak required to earn one shield */
  DAYS_PER_EARNED_SHIELD: 7,
  /** Milliseconds per day for date calculations */
  MS_PER_DAY: 1000 * 60 * 60 * 24,
} as const;

// Content Length Limits
export const CONTENT_LIMITS = {
  /** Maximum characters for habit titles */
  HABIT_TITLE_MAX: 100,
  /** Maximum characters for habit subtitles */
  HABIT_SUBTITLE_MAX: 200,
  /** Maximum characters for monthly notes */
  MONTHLY_NOTE_MAX: 8000,
  /** Maximum characters for challenge titles */
  CHALLENGE_TITLE_MAX: 100,
  /** Maximum habits per challenge */
  MAX_HABITS_PER_CHALLENGE: 50,
} as const;

// Challenge Duration Constraints
export const CHALLENGE_DURATION = {
  /** Minimum challenge duration in days */
  MIN_DAYS: 7,
  /** Maximum challenge duration in days */
  MAX_DAYS: 365,
} as const;

// Authentication Constants
export const AUTH_CONSTANTS = {
  /** Minimum password length (enhanced security) */
  MIN_PASSWORD_LENGTH: 12,
  /** Maximum password length */
  MAX_PASSWORD_LENGTH: 128,
  /** Rate limit: Max login attempts per time window */
  MAX_LOGIN_ATTEMPTS: 5,
  /** Rate limit time window in milliseconds (15 minutes) */
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,
  /** Artificial delay to prevent timing attacks (ms) */
  AUTH_TIMING_DELAY_MS: 200,
} as const;

// LocalStorage Keys
export const STORAGE_KEYS = {
  /** Theme preference (light/dark) */
  THEME: 'habit_tracker_theme',
  /** Notification preferences */
  NOTIFICATIONS_ENABLED: 'habit_tracker_notifications_enabled',
  /** Guest mode data prefix */
  GUEST_HABITS: 'habit_tracker_guest_habits',
  /** Monthly notes scoped by user and month */
  MONTHLY_NOTE_PREFIX: 'habit_tracker_note',
  /** Challenge data scoped by user */
  CHALLENGE_PREFIX: 'habit_challenge',
  /** Color Studio recent colors */
  RECENT_COLORS: 'habit_tracker_recent_colors',
  /** Streak freeze shields state */
  STREAK_SHIELDS: 'habit_tracker_streak_shields',
} as const;

// UI Animation Timings
export const ANIMATION_TIMINGS = {
  /** Quote rotation interval (ms) */
  QUOTE_ROTATION_MS: 18000,
  /** Toast notification duration (ms) */
  TOAST_DURATION_MS: 10000,
  /** Confetti animation duration (ms) */
  CONFETTI_DURATION_MS: 3000,
  /** Modal transition duration (ms) */
  MODAL_TRANSITION_MS: 300,
} as const;

// Color Validation
export const COLOR_CONSTANTS = {
  /** Regex pattern for valid hex colors */
  HEX_COLOR_PATTERN: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  /** YIQ luminance threshold for text contrast */
  YIQ_THRESHOLD: 128,
} as const;

// HTTP Status Codes (for error handling)
export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Error Messages (Generic, Safe for Client)
export const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: 'Invalid email or password.',
  ACCOUNT_EXISTS: 'An account with this email already exists.',
  WEAK_PASSWORD: 'Password must be at least 12 characters with uppercase, lowercase, number, and special character.',
  RATE_LIMIT_EXCEEDED: 'Too many attempts. Please try again in 15 minutes.',
  UNAUTHORIZED: 'You must be signed in to perform this action.',

  // Habits
  HABIT_NOT_FOUND: 'Habit not found or unauthorized.',
  EDIT_WINDOW_EXPIRED: '72-hour edit window expired. Cannot modify this date.',
  FUTURE_DATE_NOT_ALLOWED: 'Cannot mark habits as complete in the future.',

  // Challenges
  ACTIVE_CHALLENGE_EXISTS: 'You already have an active challenge. Complete or abandon it before starting a new one.',
  CHALLENGE_NOT_FOUND: 'Challenge not found or unauthorized.',
  INVALID_CHALLENGE_DURATION: 'Challenge duration must be between 7 and 365 days.',

  // Generic
  VALIDATION_ERROR: 'Invalid input. Please check your data and try again.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
} as const;

// Password Validation Patterns
export const PASSWORD_PATTERNS = {
  /** At least one uppercase letter */
  UPPERCASE: /[A-Z]/,
  /** At least one lowercase letter */
  LOWERCASE: /[a-z]/,
  /** At least one number */
  NUMBER: /[0-9]/,
  /** At least one special character */
  SPECIAL_CHAR: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
} as const;

// Request Tracking
export const REQUEST_CONSTANTS = {
  /** Header name for request ID */
  REQUEST_ID_HEADER: 'x-request-id',
  /** Length of generated request IDs */
  REQUEST_ID_LENGTH: 16,
} as const;

// Feature Flags (for gradual rollout)
export const FEATURE_FLAGS = {
  /** Enable advanced accessibility features */
  ENABLE_A11Y_ENHANCEMENTS: true,
  /** Enable request ID tracking */
  ENABLE_REQUEST_TRACKING: true,
  /** Enable localStorage encryption */
  ENABLE_STORAGE_ENCRYPTION: true,
  /** Enable rate limiting */
  ENABLE_RATE_LIMITING: true,
} as const;
