
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sanitizes a JSON object to ensure all values are properly escaped
 * This prevents errors when sending data to the server
 */
export function sanitizeJson<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'object') {
    if (Array.isArray(obj)) {
      return obj.map(item => sanitizeJson(item)) as unknown as T;
    }
    
    const result: Record<string, any> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Skip functions and non-serializable objects
        if (typeof obj[key] !== 'function' && key !== '__proto__') {
          result[key] = sanitizeJson((obj as Record<string, any>)[key]);
        }
      }
    }
    return result as T;
  }
  
  // Convert special types that might cause issues in JSON
  if (typeof obj === 'string') {
    // Replace newlines and other problematic characters
    return obj
      .replace(/\n/g, ' ')
      .replace(/\r/g, ' ')
      .replace(/\t/g, ' ') as unknown as T;
  }
  
  return obj;
}
