// Secure password utilities for server-side operations
import { supabase } from '@/integrations/supabase/client';

/**
 * Server-side password hashing using bcrypt (via Supabase Edge Function)
 * This replaces the insecure client-side SHA-256 hashing
 */
export const hashPasswordSecurely = async (password: string): Promise<string> => {
  try {
    // Call edge function for secure server-side hashing
    const { data, error } = await supabase.functions.invoke('hash-password', {
      body: { password }
    });

    if (error) {
      console.error('Password hashing failed:', error);
      throw new Error('Password hashing failed');
    }

    return data.hash;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw error;
  }
};

/**
 * Server-side password verification using bcrypt (via Supabase Edge Function)
 * This replaces the insecure client-side verification
 */
export const verifyPasswordSecurely = async (password: string, hash: string): Promise<boolean> => {
  try {
    // Call edge function for secure server-side verification
    const { data, error } = await supabase.functions.invoke('verify-password', {
      body: { password, hash }
    });

    if (error) {
      console.error('Password verification failed:', error);
      return false;
    }

    return data.valid === true;
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
};

/**
 * Legacy support for old SHA-256 hashes while transitioning to bcrypt
 * This function should be used during migration period only
 */
export const verifyPasswordLegacy = async (password: string, hash: string): Promise<boolean> => {
  try {
    // Check if it's a bcrypt hash (starts with $2)
    if (hash.startsWith('$2')) {
      return await verifyPasswordSecurely(password, hash);
    }
    
    // Legacy SHA-256 verification (deprecated)
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return computedHash === hash;
  } catch (error) {
    console.error('Error in legacy password verification:', error);
    return false;
  }
};

/**
 * Generate a secure random password with specified length and complexity
 */
export const generateSecurePassword = (length: number = 12): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  return Array.from(array, byte => charset[byte % charset.length]).join('');
};

/**
 * Validate password strength
 */
export const validatePasswordStrength = (password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) {
    score += 2;
  } else {
    feedback.push('Password must be at least 8 characters long');
  }

  // Character variety checks
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Password should contain lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Password should contain uppercase letters');

  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Password should contain numbers');

  if (/[!@#$%^&*]/.test(password)) score += 1;
  else feedback.push('Password should contain special characters');

  // Common patterns
  if (!/(.)\1{2,}/.test(password)) score += 1;
  else feedback.push('Password should not contain repeated characters');

  const isValid = score >= 5 && password.length >= 8;

  return { isValid, score, feedback };
};