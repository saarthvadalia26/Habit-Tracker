import 'server-only';
import { AUTH_CONSTANTS, PASSWORD_PATTERNS } from './constants';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HEX_COLOR_REGEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_REGEX.test(value);
}

export function isValidDate(value: unknown): value is string {
  if (typeof value !== 'string' || !DATE_REGEX.test(value)) return false;

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;

  const clean = value
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    .trim()
    .slice(0, maxLength);

  return clean || null;
}

export function cleanHexColor(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const clean = value.trim();
  return HEX_COLOR_REGEX.test(clean) ? clean : null;
}

export function cleanUuidList(value: unknown, maxItems = 50): string[] | null {
  if (!Array.isArray(value) || value.length > maxItems || !value.every(isUuid)) return null;
  return [...new Set(value)];
}

export function isValidEmail(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isValidPassword(value: unknown): value is string {
  if (typeof value !== 'string') return false;

  const { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } = AUTH_CONSTANTS;

  // Check length requirements
  if (value.length < MIN_PASSWORD_LENGTH || value.length > MAX_PASSWORD_LENGTH) {
    return false;
  }

  // Check complexity requirements (at least 3 of 4 character types)
  let complexityScore = 0;
  if (PASSWORD_PATTERNS.UPPERCASE.test(value)) complexityScore++;
  if (PASSWORD_PATTERNS.LOWERCASE.test(value)) complexityScore++;
  if (PASSWORD_PATTERNS.NUMBER.test(value)) complexityScore++;
  if (PASSWORD_PATTERNS.SPECIAL_CHAR.test(value)) complexityScore++;

  return complexityScore >= 3;
}

export function getPasswordStrength(password: string): {
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= AUTH_CONSTANTS.MIN_PASSWORD_LENGTH) {
    score += 25;
  } else {
    feedback.push(`Must be at least ${AUTH_CONSTANTS.MIN_PASSWORD_LENGTH} characters`);
  }

  if (PASSWORD_PATTERNS.UPPERCASE.test(password)) {
    score += 25;
  } else {
    feedback.push('Add uppercase letters');
  }

  if (PASSWORD_PATTERNS.LOWERCASE.test(password)) {
    score += 25;
  } else {
    feedback.push('Add lowercase letters');
  }

  if (PASSWORD_PATTERNS.NUMBER.test(password)) {
    score += 15;
  } else {
    feedback.push('Add numbers');
  }

  if (PASSWORD_PATTERNS.SPECIAL_CHAR.test(password)) {
    score += 10;
  } else {
    feedback.push('Add special characters (!@#$%^&*)');
  }

  return { score, feedback };
}

export const ALLOWED_CADENCE_TYPES = ['everyday', 'weekdays', 'weekends', 'custom', 'frequency'] as const;
export type ValidCadenceType = (typeof ALLOWED_CADENCE_TYPES)[number];

export function isValidCadenceType(value: unknown): value is ValidCadenceType {
  return typeof value === 'string' && (ALLOWED_CADENCE_TYPES as readonly string[]).includes(value);
}

export function cleanCadenceDays(value: unknown): number[] | null {
  if (!Array.isArray(value)) return null;
  if (value.length > 7) return null;
  const days = value.filter(
    (d): d is number => typeof d === 'number' && Number.isInteger(d) && d >= 0 && d <= 6
  );
  if (days.length === 0) return null;
  return [...new Set(days)].sort((a, b) => a - b);
}

export function isValidFrequency(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 7;
}

export const ALLOWED_TIME_OF_DAY = ['morning', 'afternoon', 'evening', 'anytime'] as const;
export type ValidTimeOfDay = (typeof ALLOWED_TIME_OF_DAY)[number];

export function isValidTimeOfDay(value: unknown): value is ValidTimeOfDay {
  return typeof value === 'string' && (ALLOWED_TIME_OF_DAY as readonly string[]).includes(value);
}

export const ALLOWED_STACK_TRIGGER_TYPES = ['none', 'habit', 'custom'] as const;
export type ValidStackTriggerType = (typeof ALLOWED_STACK_TRIGGER_TYPES)[number];

export function isValidStackTriggerType(value: unknown): value is ValidStackTriggerType {
  return typeof value === 'string' && (ALLOWED_STACK_TRIGGER_TYPES as readonly string[]).includes(value);
}

export function cleanStackCue(value: unknown, maxLength = 80): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    .trim()
    .slice(0, maxLength);
}


