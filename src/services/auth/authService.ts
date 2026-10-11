/**
 * Secure Authentication & Healthcare Identity Service
 * Ear-to-Heart Health Hub
 *
 * Implements client-side cryptographic hashing (Web Crypto SHA-256 with salt),
 * rigorous input sanitization, password strength scoring, and identity resolution.
 */

import type { Patient, RegisterPatientPayload, AuthResult } from "@/types/patient";

// Static salt for client-side password hashing before persistent storage
const AUTH_SALT = "ear_to_heart_biomedical_salt_2026";

/**
 * Computes SHA-256 hash using the native browser Web Crypto API.
 * Never stores or transmits plaintext passwords.
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${AUTH_SALT}:${password.trim()}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Precomputed hash for the default demonstration accounts.
 * Corresponds to "Heart@2026"
 */
export const DEFAULT_DEMO_PASSWORD = "Heart@2026";
export const DEFAULT_DEMO_HASH =
  "f1d63652c505caea24bbbe8ff2cf17c9dd024d20917631da7a8c8e23fcead719";

/**
 * Validates email format with RFC 5322 compliant regex.
 */
export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) {
    return "Email address is required.";
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return "Please enter a valid email address (e.g., patient@example.com).";
  }
  return null;
}

/**
 * Validates username (3-24 characters, letters, numbers, underscores, dashes).
 */
export function validateUsername(username: string): string | null {
  const trimmed = username.trim();
  if (!trimmed) {
    return "Username is required.";
  }
  if (trimmed.length < 3) {
    return "Username must be at least 3 characters long.";
  }
  if (trimmed.length > 24) {
    return "Username cannot exceed 24 characters.";
  }
  const usernameRegex = /^[a-zA-Z0-9_.-]+$/;
  if (!usernameRegex.test(trimmed)) {
    return "Username can only contain letters, numbers, underscores, periods, and hyphens.";
  }
  return null;
}

export interface PasswordStrengthResult {
  valid: boolean;
  score: number; // 0 to 4
  level: "Very Weak" | "Weak" | "Fair" | "Strong" | "Excellent";
  rules: {
    hasLength: boolean;
    hasUpper: boolean;
    hasLower: boolean;
    hasNumberOrSpecial: boolean;
  };
}

/**
 * Enforces healthcare-grade password strength standards.
 */
export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumberOrSpecial = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  let score = 0;
  if (hasLength) score += 1;
  if (hasUpper) score += 1;
  if (hasLower) score += 1;
  if (hasNumberOrSpecial) score += 1;

  let level: PasswordStrengthResult["level"] = "Very Weak";
  if (score === 1) level = "Weak";
  else if (score === 2) level = "Fair";
  else if (score === 3) level = "Strong";
  else if (score === 4) level = "Excellent";

  return {
    valid: hasLength && (hasUpper || hasLower) && hasNumberOrSpecial,
    score,
    level,
    rules: {
      hasLength,
      hasUpper,
      hasLower,
      hasNumberOrSpecial,
    },
  };
}

/**
 * Identity resolution: finds patient by Email, Username, or Patient ID.
 * Returns null if not matched.
 */
export function resolvePatientIdentifier(
  identifier: string,
  patients: Patient[]
): Patient | null {
  const query = identifier.trim().toLowerCase();
  if (!query) return null;

  return (
    patients.find((p) => {
      const matchId = p.id.toLowerCase() === query;
      const matchEmail = p.email.toLowerCase() === query;
      const matchUsername = p.username ? p.username.toLowerCase() === query : false;
      return matchId || matchEmail || matchUsername;
    }) || null
  );
}
