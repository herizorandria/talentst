
import { generateSecureShortCode, isSecureValidUrl } from './securityUtils';

export const generateShortCode = async (): Promise<string> => {
  return await generateSecureShortCode();
};

export const isValidUrl = (url: string): boolean => {
  return isSecureValidUrl(url);
};

export const createShortUrl = (shortCode: string): string => {
  return `${window.location.origin}/${shortCode}`;
};

// Validate expiration
export const isUrlExpired = (expiresAt?: Date): boolean => {
  if (!expiresAt) return false;
  return new Date() > expiresAt;
};
