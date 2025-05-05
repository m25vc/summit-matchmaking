
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
          
          // Detailed logging for string values
          if (typeof value === 'string') {
            const hasControlChars = /[\u0000-\u001F]/.test(value);
            const hasNewlines = value.includes('\n') || value.includes('\r') || value.includes('\t');
            
            if (hasControlChars || hasNewlines) {
              console.log(`⚠️ FOUND CONTROL CHARACTERS in field '${key}':`);
              console.log(`   Raw value: ${value}`);
              console.log(`   JSON.stringify: ${JSON.stringify(value)}`);
              console.log(`   Contains \\n: ${value.includes('\n')}`);
              console.log(`   Contains \\r: ${value.includes('\r')}`);
              console.log(`   Contains \\t: ${value.includes('\t')}`);
              console.log(`   Unicode analysis: ${Array.from(value).map(c => `${c} (${c.charCodeAt(0)})`).join(', ')}`);
            }
          }
          
          // Process the value
          result[key] = sanitizeJson(value);
        }
      }
    }
    return result as T;
  }
  
  // Enhanced string handling with detailed logging for problematic strings
  if (typeof obj === 'string') {
    // Debug logging for problematic characters
    const hasControlChars = /[\u0000-\u001F]/.test(obj);
    const hasNewlines = obj.includes('\n') || obj.includes('\r') || obj.includes('\t');
    
    if (hasControlChars || hasNewlines) {
      console.log(`🔤 STRING SANITIZATION for string of length ${obj.length}:`);
      console.log(`   First 30 chars: ${obj.substring(0, 30).replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t")}`);
      console.log(`   Control chars found: ${hasControlChars}, Newlines found: ${hasNewlines}`);
      
      // Show character codes for better debugging
      if (obj.length < 100) {
        const charCodes = Array.from(obj).map(c => `${c} (${c.charCodeAt(0)})`).join(', ');
        console.log(`   Character analysis: ${charCodes}`);
      }
    }
    
    // Replace with actual escaped versions - not just spaces
    const sanitized = obj
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
    
    return sanitized as unknown as T;
  }
  
  return obj;
}

/**
 * More aggressive JSON sanitization - use this if other methods fail
 * Converts to JSON string and then parses back to ensure valid JSON
 */
export function deepSanitizeJson<T>(obj: T): T {
  console.log("🔬 ENTERING deepSanitizeJson");
  try {
    // First sanitize using our regular function
    const sanitized = sanitizeJson(obj);
    console.log("🧼 After initial sanitizeJson:", sanitized);
    
    // Stringify the object with special error handling
    const jsonString = JSON.stringify(sanitized, (key, value) => {
      if (typeof value === 'string') {
        // Additional check for any control characters
        if (/[\u0000-\u001F]/.test(value)) {
          console.log(`⚠️ STRINGIFY found control chars in '${key}':`, 
                      value.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t"));
          
          // Return value with explicit replacements
          return value
            .replace(/\n/g, "\\n")
            .replace(/\r/g, "\\r")
            .replace(/\t/g, "\\t");
        }
      }
      return value;
    });
    
    console.log("📝 Stringified JSON (first 200 chars):", 
                jsonString.length > 200 ? jsonString.substring(0, 200) + '...' : jsonString);
    
    // Parse the string back to an object
    const result = JSON.parse(jsonString);
    console.log("✅ Successfully parsed back to object");
    
    return result as T;
  } catch (error) {
    console.error("❌ FAILED TO DEEP SANITIZE JSON:", error);
    console.log("❌ Error details:", {
      name: (error as Error).name,
      message: (error as Error).message,
      stack: (error as Error).stack
    });
    // Return a basic object if all else fails
    return {} as T;
  }
}
