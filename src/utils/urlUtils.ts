
export const generateShortCode = (): string => {
  return Math.random().toString(36).substring(2, 8);
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const createShortUrl = (shortCode: string): string => {
  return `${window.location.origin}/${shortCode}`;
};
