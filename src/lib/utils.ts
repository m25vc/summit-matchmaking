import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Enhanced JSON sanitizer that aggressively removes ALL control characters
 * to prevent PostgreSQL parsing issues
 */
export function sanitizeJson(value: any): any {
  // Base case: null or undefined values pass through unchanged
  if (value === null || value === undefined) {
    return value;
  }
  
  // Handle string values - our primary concern for sanitization
  if (typeof value === 'string') {
    // AGGRESSIVELY remove ALL control and non-printable characters
    // This removes newlines, tabs, null bytes, and any other problematic chars
    return value.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
  }
  
  // Handle arrays recursively
  if (Array.isArray(value)) {
    return value.map(item => sanitizeJson(item));
  }
  
  // Handle objects recursively
  if (typeof value === 'object') {
    const sanitized: Record<string, any> = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        sanitized[key] = sanitizeJson(value[key]);
      }
    }
    return sanitized;
  }
  
  // All other types (numbers, booleans) pass through unchanged
  return value;
}

/**
 * Strict enum value validator to ensure data matches expected options
 */
export function validateEnum<T extends string>(value: string | null | undefined, validValues: T[]): T | null {
  if (value === null || value === undefined) return null;
  
  // Sanitize the string first to remove any problematic characters
  const sanitized = sanitizeJson(value) as string;
  
  // Check if the sanitized value is valid
  if (validValues.includes(sanitized as T)) {
    return sanitized as T;
  }
  
  console.warn(`Invalid enum value "${value}" (sanitized to "${sanitized}"), valid values are: ${validValues.join(', ')}`);
  return null;
}
