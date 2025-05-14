
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sanitize JSON data by removing control characters that can cause
 * parsing issues in PostgreSQL/Supabase
 */
export function sanitizeJson(value: any): any {
  if (value === null || value === undefined) {
    return value;
  }
  
  if (typeof value === 'string') {
    // Remove ALL control characters (0x00-0x1F, 0x7F-0x9F)
    return value.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
  }
  
  if (Array.isArray(value)) {
    return value.map(item => sanitizeJson(item));
  }
  
  if (typeof value === 'object') {
    const sanitized: Record<string, any> = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        sanitized[key] = sanitizeJson(value[key]);
      }
    }
    return sanitized;
  }
  
  return value;
}
