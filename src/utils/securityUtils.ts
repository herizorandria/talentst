
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

// Password hashing using Web Crypto API
export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Verify password
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
};

// DEPRECATED: Basic XOR encryption for localStorage 
// WARNING: This is not cryptographically secure and should only be used for obfuscation
// For production applications, use proper encryption or store sensitive data server-side
const generateEncryptionKey = (): Uint8Array => {
  // Generate a random key each session for basic obfuscation
  const key = new Uint8Array(32);
  crypto.getRandomValues(key);
  return key;
};

let sessionKey: Uint8Array | null = null;

export const encryptData = async (data: string): Promise<string> => {
  try {
    console.warn('WARNING: Using deprecated client-side encryption. Consider server-side storage.');
    
    if (!sessionKey) {
      sessionKey = generateEncryptionKey();
    }
    
    const encoder = new TextEncoder();
    const dataArray = encoder.encode(data);
    
    const encrypted = dataArray.map((byte, index) => 
      byte ^ sessionKey![index % sessionKey!.length]
    );
    
    // Prepend the key for this session
    const keyAndData = new Uint8Array(sessionKey.length + encrypted.length);
    keyAndData.set(sessionKey);
    keyAndData.set(encrypted, sessionKey.length);
    
    return btoa(String.fromCharCode(...keyAndData));
  } catch {
    return data; // Fallback to unencrypted if encryption fails
  }
};

export const decryptData = async (encryptedData: string): Promise<string> => {
  try {
    const keyAndData = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    
    if (keyAndData.length < 32) {
      throw new Error('Invalid encrypted data format');
    }
    
    const key = keyAndData.slice(0, 32);
    const encrypted = keyAndData.slice(32);
    
    const decrypted = encrypted.map((byte, index) => 
      byte ^ key[index % key.length]
    );
    
    return new TextDecoder().decode(decrypted);
  } catch {
    return encryptedData; // Fallback if decryption fails
  }
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
