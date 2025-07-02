
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

// Input sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .trim();
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

// Encrypted storage utilities
const ENCRYPTION_KEY = 'shortlink-secure-key-v1';

export const encryptData = async (data: string): Promise<string> => {
  try {
    // Simple encryption for localStorage (note: not cryptographically secure for production)
    const encoder = new TextEncoder();
    const dataArray = encoder.encode(data);
    const keyArray = encoder.encode(ENCRYPTION_KEY);
    
    const encrypted = dataArray.map((byte, index) => 
      byte ^ keyArray[index % keyArray.length]
    );
    
    return btoa(String.fromCharCode(...encrypted));
  } catch {
    return data; // Fallback to unencrypted if encryption fails
  }
};

export const decryptData = async (encryptedData: string): Promise<string> => {
  try {
    const encrypted = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
    const encoder = new TextEncoder();
    const keyArray = encoder.encode(ENCRYPTION_KEY);
    
    const decrypted = encrypted.map((byte, index) => 
      byte ^ keyArray[index % keyArray.length]
    );
    
    return new TextDecoder().decode(decrypted);
  } catch {
    return encryptedData; // Fallback if decryption fails
  }
};

// Rate limiting
const rateLimitMap = new Map<string, number[]>();

export const checkRateLimit = (identifier: string, maxRequests: number = 10, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const requests = rateLimitMap.get(identifier) || [];
  
  // Clean old requests outside the window
  const validRequests = requests.filter(timestamp => now - timestamp < windowMs);
  
  if (validRequests.length >= maxRequests) {
    return false; // Rate limit exceeded
  }
  
  validRequests.push(now);
  rateLimitMap.set(identifier, validRequests);
  return true;
};
