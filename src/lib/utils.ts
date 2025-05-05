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
    // Add debugging to help identify problematic fields
    console.log('Sanitizing object:', JSON.stringify(obj));
    
    if (Array.isArray(obj)) {
      return obj.map(item => sanitizeJson(item)) as unknown as T;
    }
    
    const result: Record<string, any> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // Skip functions and non-serializable objects
        if (typeof obj[key] !== 'function' && key !== '__proto__') {
          const value = (obj as Record<string, any>)[key];
          
          // Debug any problematic string values and check for control characters
          if (typeof value === 'string' && (/[\u0000-\u001F]/.test(value) || value.includes('\n') || value.includes('\r') || value.includes('\t'))) {
            console.log(`Found control character in field '${key}':`, JSON.stringify(value));
          }
          
          result[key] = sanitizeJson(value);
        }
      }
    }
    return result as T;
  }
  
  // Convert special types that might cause issues in JSON
  if (typeof obj === 'string') {
    // Check for and log problematic characters
    if (obj.includes('\n') || obj.includes('\r') || obj.includes('\t') || /[\u0000-\u001F]/.test(obj)) {
      console.log('Found control character in string:', JSON.stringify(obj));
    }
    
    // Just return the string as-is - we'll let JSON.stringify handle proper escaping
    return obj as unknown as T;
  }
  
  return obj;
}

/**
 * More aggressive JSON sanitization - use this if other methods fail
 * Converts to JSON string and then parses back to ensure valid JSON
 */
export function deepSanitizeJson<T>(obj: T): T {
  try {
    // First sanitize using our regular function
    const sanitized = sanitizeJson(obj);
    
    // Then stringify and parse to ensure it's valid JSON
    // The JSON.stringify automatically handles proper escaping of control characters
    const jsonString = JSON.stringify(sanitized);
    console.log('Stringified JSON:', jsonString);
    
    // Parse back to JS object
    const parsedObj = JSON.parse(jsonString) as T;
    
    return parsedObj;
  } catch (error) {
    console.error('Failed to deep sanitize JSON:', error);
    // Return a basic object if all else fails
    return {} as T;
  }
}