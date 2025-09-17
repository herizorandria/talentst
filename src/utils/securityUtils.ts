
// Cryptographically secure random generation
export const generateSecureShortCode = async (): Promise<string> => {
  const array = new Uint8Array(6);
  crypto.getRandomValues(array);
  return Array.from(array, byte => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return chars[byte % chars.length];
  }).join('');
};

// Enhanced URL validation with security checks
export const isSecureValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    
    // Block dangerous protocols
    const allowedProtocols = ['http:', 'https:'];
    if (!allowedProtocols.includes(urlObj.protocol)) {
      return false;
    }
    
    // Block localhost and private IP ranges for security
    const hostname = urlObj.hostname.toLowerCase();
    if (hostname === 'localhost' || 
        hostname === '127.0.0.1' || 
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.')) {
      return false;
    }
    
    // Block suspicious patterns
    const suspiciousPatterns = [
      'javascript:',
      'data:',
      'vbscript:',
      'file:',
      'ftp:'
    ];
    
    const fullUrl = url.toLowerCase();
    if (suspiciousPatterns.some(pattern => fullUrl.includes(pattern))) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
};

// Enhanced input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/data:/gi, '') // Remove data protocol
    .replace(/vbscript:/gi, '') // Remove vbscript protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
};

// Sanitize URL input specifically
export const sanitizeUrlInput = (url: string): string => {
  // First apply general sanitization
  let sanitized = sanitizeInput(url);
  
  // Remove any remaining dangerous protocols
  const dangerousProtocols = [
    'javascript:', 'data:', 'vbscript:', 'file:', 'ftp:',
    'mailto:', 'tel:', 'sms:', 'about:', 'chrome:', 'edge:'
  ];
  
  const lowerUrl = sanitized.toLowerCase();
  for (const protocol of dangerousProtocols) {
    if (lowerUrl.includes(protocol)) {
      throw new Error(`Dangerous protocol detected: ${protocol}`);
    }
  }
  
  return sanitized;
};

// DEPRECATED: Password hashing using Web Crypto API
// WARNING: This is deprecated and insecure. Use bcrypt via edge functions instead.
export const hashPassword = async (password: string): Promise<string> => {
  console.warn('DEPRECATED: hashPassword using SHA-256 is insecure. Use bcrypt via edge functions.');
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// DEPRECATED: Verify password
// WARNING: This is deprecated and insecure. Use bcrypt via edge functions instead.
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  console.warn('DEPRECATED: verifyPassword using SHA-256 is insecure. Use bcrypt via edge functions.');
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
};

// DEPRECATED AND REMOVED: Basic XOR encryption for localStorage 
// WARNING: This is not cryptographically secure and has been removed for security
// Use server-side storage for sensitive data instead
const generateEncryptionKey = (): Uint8Array => {
  // Generate a random key each session for basic obfuscation
  const key = new Uint8Array(32);
  crypto.getRandomValues(key);
  return key;
};

let sessionKey: Uint8Array | null = null;

// DEPRECATED AND REMOVED: Insecure client-side encryption functions
// These functions have been removed for security reasons
export const encryptData = async (data: string): Promise<string> => {
  console.error('SECURITY ERROR: encryptData has been disabled. Use server-side storage for sensitive data.');
  throw new Error('Client-side encryption has been disabled for security reasons. Use server-side storage.');
};

export const decryptData = async (encryptedData: string): Promise<string> => {
  console.error('SECURITY ERROR: decryptData has been disabled. Use server-side storage for sensitive data.');
  throw new Error('Client-side decryption has been disabled for security reasons. Use server-side storage.');
};

// Enhanced rate limiting with different tiers
const rateLimitMap = new Map<string, number[]>();

export const checkRateLimit = (
  identifier: string, 
  maxRequests: number = 10, 
  windowMs: number = 60000,
  action: 'url_creation' | 'password_attempt' | 'general' = 'general'
): boolean => {
  const now = Date.now();
  const key = `${identifier}-${action}`;
  const requests = rateLimitMap.get(key) || [];
  
  // Clean old requests outside the window
  const validRequests = requests.filter(timestamp => now - timestamp < windowMs);
  
  // Different limits for different actions
  let actualMaxRequests = maxRequests;
  let actualWindowMs = windowMs;
  
  switch (action) {
    case 'url_creation':
      actualMaxRequests = 5; // 5 URLs per minute per user
      actualWindowMs = 60000; // 1 minute
      break;
    case 'password_attempt':
      actualMaxRequests = 3; // 3 password attempts per 5 minutes
      actualWindowMs = 5 * 60000; // 5 minutes
      break;
    case 'general':
      actualMaxRequests = maxRequests;
      actualWindowMs = windowMs;
      break;
  }
  
  if (validRequests.length >= actualMaxRequests) {
    console.warn(`Rate limit exceeded for ${identifier} on ${action}: ${validRequests.length}/${actualMaxRequests}`);
    return false; // Rate limit exceeded
  }
  
  validRequests.push(now);
  rateLimitMap.set(key, validRequests);
  return true;
};

// Clear old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  
  for (const [key, requests] of rateLimitMap.entries()) {
    const validRequests = requests.filter(timestamp => now - timestamp < oneHour);
    if (validRequests.length === 0) {
      rateLimitMap.delete(key);
    } else {
      rateLimitMap.set(key, validRequests);
    }
  }
}, 5 * 60 * 1000); // Clean every 5 minutes
