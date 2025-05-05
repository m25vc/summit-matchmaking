
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * A safe JSON stringify function that handles circular references and special characters
 */
export function safeJsonStringify(obj: any, space?: number): string {
  const cache = new Set();
  
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) {
        return '[Circular Reference]';
      }
      cache.add(value);
    }
    
    // Handle special values that might cause JSON issues
    if (typeof value === 'string') {
      // Remove control characters that can break JSON
      return value.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
    }
    
    return value;
  }, space);
}

/**
 * Safe-parses a JSON string with error handling
 */
export function safeJsonParse(jsonString: string, fallback: any = {}): any {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    return fallback;
  }
}

/**
 * Sanitizes a JSON object to ensure all values are properly escaped
 * This prevents errors when sending data to the server
 */
export function sanitizeJson<T>(obj: T): T {
  console.log("🔍 ENTERING sanitizeJson with:", typeof obj, obj === null ? 'null' : obj === undefined ? 'undefined' : '');
  
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'object') {
    console.log("📦 OBJECT SANITIZATION:", JSON.stringify(obj, (key, value) => {
      if (typeof value === 'string' && value.length > 100) {
        return value.substring(0, 100) + '... [truncated]';
      }
      return value;
    }));
    
    if (Array.isArray(obj)) {
      return obj.map(item => sanitizeJson(item)) as unknown as T;
    }
    
    const result: Record<string, any> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Skip functions and non-serializable objects
        if (typeof obj[key] !== 'function' && key !== '__proto__') {
          const value = (obj as Record<string, any>)[key];
          
          // Handle all types
          result[key] = sanitizeJson(value);
        }
      }
    }
    return result as T;
  }
  
  // Enhanced string handling - completely remove all control characters
  if (typeof obj === 'string') {
    return obj.replace(/[\x00-\x1F\x7F-\x9F]/g, '') as unknown as T;
  }
  
  return obj;
}

/**
 * More aggressive JSON sanitization
 * Uses a complete replacement strategy for problematic characters
 */
export function deepSanitizeJson<T>(obj: T): T {
  try {
    // Convert to string and back, with special handling for control characters
    const jsonString = JSON.stringify(obj, (key, value) => {
      if (typeof value === 'string') {
        // Remove all control characters
        return value.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
      }
      return value;
    });
    
    // Parse the sanitized JSON string back to an object
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to sanitize JSON:", error);
    // Return a safe value if all else fails
    return {} as T;
  }
}
