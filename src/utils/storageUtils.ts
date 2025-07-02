
import { ShortenedUrl } from '@/types/url';
import { encryptData, decryptData, hashPassword } from './securityUtils';

const STORAGE_KEY = 'shortenedUrls';

export const saveUrlsSecurely = async (urls: ShortenedUrl[]): Promise<void> => {
  try {
    // Hash passwords before storing
    const secureUrls = await Promise.all(
      urls.map(async (url) => ({
        ...url,
        password: url.password ? await hashPassword(url.password) : undefined,
        createdAt: url.createdAt.toISOString(),
        lastClickedAt: url.lastClickedAt?.toISOString(),
        expiresAt: url.expiresAt?.toISOString()
      }))
    );
    
    const dataString = JSON.stringify(secureUrls);
    const encryptedData = await encryptData(dataString);
    localStorage.setItem(STORAGE_KEY, encryptedData);
  } catch (error) {
    console.error('Failed to save URLs securely:', error);
    // Fallback to regular storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(urls));
  }
};

export const loadUrlsSecurely = async (): Promise<ShortenedUrl[]> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const decryptedData = await decryptData(stored);
    const parsedUrls = JSON.parse(decryptedData);
    
    return parsedUrls.map((url: any) => ({
      ...url,
      createdAt: new Date(url.createdAt),
      lastClickedAt: url.lastClickedAt ? new Date(url.lastClickedAt) : undefined,
      expiresAt: url.expiresAt ? new Date(url.expiresAt) : undefined
    }));
  } catch (error) {
    console.error('Failed to load URLs securely:', error);
    // Fallback to regular loading
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedUrls = JSON.parse(saved);
        return parsedUrls.map((url: any) => ({
          ...url,
          createdAt: new Date(url.createdAt),
          lastClickedAt: url.lastClickedAt ? new Date(url.lastClickedAt) : undefined,
          expiresAt: url.expiresAt ? new Date(url.expiresAt) : undefined
        }));
      } catch {
        return [];
      }
    }
    return [];
  }
};
