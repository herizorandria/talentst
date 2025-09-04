// Utilitaires optimisés pour détecter les informations du navigateur et de l'appareil
import { UAParser } from 'ua-parser-js';

export interface DeviceInfo {
  browser: string;
  device: string;
  os: string;
}

export const detectDeviceInfo = (userAgent: string): DeviceInfo => {
  try {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    
    const browser = result.browser.name || 'Inconnu';
    const device = result.device.type === 'mobile' ? 'Mobile' : 
                   result.device.type === 'tablet' ? 'Tablet' : 'Desktop';
    const os = result.os.name || 'Inconnu';
    
    return { browser, device, os };
  } catch (error) {
    console.warn('Erreur parsing user agent:', error);
    // Fallback vers l'ancienne méthode en cas d'erreur
    return detectDeviceInfoFallback(userAgent);
  }
};

// Méthode fallback en cas d'erreur avec UAParser
const detectDeviceInfoFallback = (userAgent: string): DeviceInfo => {
  const ua = userAgent.toLowerCase();
  
  // Détection du navigateur (optimisée)
  let browser = 'Inconnu';
  if (ua.includes('edg')) browser = 'Edge';
  else if (ua.includes('chrome')) browser = 'Chrome';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('opera') || ua.includes('opr')) browser = 'Opera';
  
  // Détection de l'appareil (optimisée)
  let device = 'Desktop';
  if (ua.includes('mobile')) device = 'Mobile';
  else if (ua.includes('tablet') || ua.includes('ipad')) device = 'Tablet';
  
  // Détection de l'OS (optimisée)
  let os = 'Inconnu';
  if (ua.includes('android')) os = 'Android';
  else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
  else if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac')) os = 'macOS';
  else if (ua.includes('linux')) os = 'Linux';
  
  return { browser, device, os };
};

// Cache pour éviter les appels API répétés
const ipCache = new Map<string, string>();
const locationCache = new Map<string, { country: string; city: string; countryCode?: string }>();

// Backoff map to avoid repeatedly hitting a provider that returned CORS/429/network errors
const providerBackoff = new Map<string, number>();
const isProviderBackedOff = (url: string) => {
  const until = providerBackoff.get(url);
  return typeof until === 'number' && until > Date.now();
};
const backoffProvider = (url: string, minutes = 5) => {
  providerBackoff.set(url, Date.now() + minutes * 60 * 1000);
};

// Petit helper pour fetch avec timeout et parsing JSON
// Retourne null en cas d'erreur réseau/CORS/429 pour laisser le code appelant essayer un fallback.
const fetchJsonWithTimeout = async (url: string, timeoutMs = 5000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
    clearTimeout(id);
    if (!res.ok) {
      const err: Error & { status?: number } = new Error(`HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return await res.json();
  } catch (e: unknown) {
    // Normalize common failure modes (CORS, network, timeout)
    const isAbort = (err: unknown): boolean => {
      if (typeof err !== 'object' || err === null) return false;
      const rec = err as Record<string, unknown>;
      const name = rec['name'];
      return typeof name === 'string' && name === 'AbortError';
    };
    const hasStatus = (err: unknown): number | undefined => {
      if (typeof err !== 'object' || err === null) return undefined;
      const rec = err as Record<string, unknown>;
      const status = rec['status'];
      return typeof status === 'number' ? status : undefined;
    };

    if (isAbort(e)) {
      console.debug('fetch timeout:', url);
    } else if (e instanceof TypeError && String(e).toLowerCase().includes('failed to fetch')) {
      console.debug('fetch network/CORS error:', url);
    } else if (hasStatus(e) === 429) {
      console.debug('fetch returned 429 Too Many Requests:', url);
    } else {
      console.debug('fetch error for', url, e);
    }
    return null;
  } finally {
    clearTimeout(id);
  }
};

// Helper pour convertir en Record en sûreté (évite 'any')
const toRecord = (d: unknown): Record<string, unknown> | null => (typeof d === 'object' && d !== null) ? d as Record<string, unknown> : null;

// Fonction ultra-rapide pour obtenir l'IP avec cache et timeout court
export const getClientIP = async (): Promise<string> => {
  const cacheKey = 'current_ip';

  // Vérifier le cache d'abord
  if (ipCache.has(cacheKey)) {
    return ipCache.get(cacheKey)!;
  }

  // Liste de providers robustes (ordonner par fiabilité/CORS)
  type IpProvider = { url: string; pick: (data: unknown) => string | undefined };
  const toRecord = (d: unknown): Record<string, unknown> | null => (typeof d === 'object' && d !== null) ? d as Record<string, unknown> : null;

  const providers: IpProvider[] = [
    { url: 'https://api.ipify.org?format=json', pick: (d) => { const r = toRecord(d); return r && typeof r.ip === 'string' ? r.ip : undefined; } },
    { url: 'https://api64.ipify.org?format=json', pick: (d) => { const r = toRecord(d); return r && typeof r.ip === 'string' ? r.ip : undefined; } },
    { url: 'https://ifconfig.co/json', pick: (d) => { const r = toRecord(d); return r && typeof r.ip === 'string' ? r.ip : undefined; } },
    { url: 'https://ipwhois.app/json/', pick: (d) => { const r = toRecord(d); return r && typeof r.ip === 'string' ? r.ip : undefined; } },
  ];

  for (const p of providers) {
    // Skip providers currently backed off
    if (isProviderBackedOff(p.url)) {
      console.debug('Skipping backed-off IP provider:', p.url);
      continue;
    }
    try {
      const data = await fetchJsonWithTimeout(p.url, 4000);
      if (!data) {
        // Treat as transient provider failure (CORS/rate-limit/network)
        backoffProvider(p.url, 5);
        continue;
      }
  const record = toRecord(data);
  const possibleIp = record && typeof record.ip === 'string' ? record.ip : undefined;
  const ip = p.pick(data) || possibleIp || 'Inconnu';
      if (ip && ip !== 'Inconnu') {
        // Mettre en cache pour 5 minutes
        ipCache.set(cacheKey, ip);
        setTimeout(() => ipCache.delete(cacheKey), 5 * 60 * 1000);
        return ip;
      }
    } catch (err) {
      // Provider returned a non-JSON or HTTP error; mark it for backoff and continue
      console.debug('getClientIP provider failed:', p.url, err);
      backoffProvider(p.url, 5);
    }
  }

  return 'Inconnu';
};

// Fonction ultra-rapide pour la géolocalisation avec cache et fallback
export const getLocationFromIP = async (ip: string): Promise<{ country: string; city: string; countryCode?: string }> => {
  if (ip === 'Inconnu') {
    return { country: 'Inconnu', city: 'Inconnu' };
  }

  // Vérifier le cache d'abord
  if (locationCache.has(ip)) {
    return locationCache.get(ip)!;
  }

  type LocationProvider = { url: string; pick: (data: unknown) => { country?: string; city?: string; countryCode?: string } | undefined };
  const providers: LocationProvider[] = [
  { url: `https://ipapi.co/${ip}/json/`, pick: (d) => { const r = toRecord(d); if (!r) return undefined; const country = typeof r.country_name === 'string' ? r.country_name : (typeof r.country === 'string' ? r.country : undefined); const city = typeof r.city === 'string' ? r.city : undefined; const countryCode = typeof r.country_code === 'string' ? r.country_code : (r['country_code'] && typeof r['country_code'] === 'string' ? r['country_code'] as string : undefined); return { country, city, countryCode }; } },
    { url: `https://ipwhois.app/json/${ip}`, pick: (d) => { const r = toRecord(d); return r ? { country: typeof r.country === 'string' ? r.country as string : undefined, city: typeof r.city === 'string' ? r.city as string : undefined, countryCode: typeof r.country === 'string' ? r.country as string : undefined } : undefined; } },
    { url: `https://ipapi.co/${ip}/country_name/`, pick: (d) => { const r = toRecord(d); return r ? { country: String(r).trim(), city: 'Inconnu' } : undefined; } },
  ];

  for (const p of providers) {
    if (isProviderBackedOff(p.url)) {
      console.debug('Skipping backed-off location provider:', p.url);
      continue;
    }
    try {
      const data = await fetchJsonWithTimeout(p.url, 4000);
      if (!data) {
        // Provider likely failed due to CORS/429/network - backoff and continue
        backoffProvider(p.url, 10);
        continue;
      }

  const pick = p.pick(data);
  const country = (pick?.country && String(pick.country).trim()) || 'Inconnu';
  const city = (pick?.city && String(pick.city).trim()) || 'Inconnu';
  const countryCode = pick?.countryCode ? String(pick.countryCode).trim() : undefined;

  const location = { country, city, countryCode };
  // Cache pour 1 heure
  locationCache.set(ip, location);
  setTimeout(() => locationCache.delete(ip), 60 * 60 * 1000);
  return location;
    } catch (err) {
      console.debug('getLocationFromIP provider failed:', p.url, err);
      backoffProvider(p.url, 10);
    }
  }

  return { country: 'Inconnu', city: 'Inconnu' };
};

// Fonction optimisée pour enregistrer les clics en arrière-plan
export const recordClick = async (
  shortUrlId: string,
  opts?: { ip?: string; country?: string; city?: string }
) => {
  // Enregistrer immédiatement les données de base sans attendre les APIs
  const userAgent = navigator.userAgent;
  const deviceInfo = detectDeviceInfo(userAgent);
  const referrer = document.referrer || 'Direct';

  // Normaliser les valeurs fournies
  const providedIp = (opts?.ip && opts.ip !== 'Inconnu') ? opts.ip : undefined;
  const providedCountry = (opts?.country && opts.country !== 'Inconnu') ? opts.country : undefined;
  const providedCity = (opts?.city && opts.city !== 'Inconnu') ? opts.city : undefined;

  // Données à enregistrer immédiatement (si données fournies, les utiliser directement)
  const baseClickData = {
    short_url_id: shortUrlId,
    user_agent: userAgent,
    browser: deviceInfo.browser,
    device: deviceInfo.device,
    os: deviceInfo.os,
    referrer: referrer,
    ip: providedIp ?? 'En cours...',
    location_country: providedCountry ?? 'En cours...',
    location_city: providedCity ?? 'En cours...'
  };

  try {
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: insertedData, error: insertError } = await supabase
      .from('url_clicks')
      .insert(baseClickData)
      .select('id')
      .single();

    if (insertError) {
      console.error('Erreur lors de l\'enregistrement initial:', insertError);
      return;
    }

    console.debug('Inserted click row response:', insertedData);
    const clickId = insertedData?.id;
    if (!clickId) {
      console.warn('Inserted click did not return id, skipping background location update');
      return;
    }

    // Si aucune donnée fiable n'a été fournie, compléter en arrière-plan
    const needsBgUpdate = !providedIp || !providedCountry || !providedCity;
    if (needsBgUpdate) {
      updateLocationDataInBackground(String(clickId));
    }

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du clic:', error);
  }
};

// Fonction pour mettre à jour les données de localisation en arrière-plan
const updateLocationDataInBackground = async (clickId: string) => {
  try {
    // Obtenir l'IP puis la localisation (optimiste: essayer de faire en parallèle)
    const ip = await getClientIP();

    let location = { country: 'Inconnu', city: 'Inconnu' };
    if (ip !== 'Inconnu') {
      try {
        location = await getLocationFromIP(ip);
      } catch (error) {
        console.warn('Erreur géolocalisation en arrière-plan:', error);
      }
    }

    // Mettre à jour l'enregistrement avec les vraies données
    const { supabase } = await import('@/integrations/supabase/client');
    // Try update and request the updated row to inspect what was saved
    const tryUpdate = async () => {
      const res = await supabase
        .from('url_clicks')
        .update({
          ip: ip,
          location_country: location.country,
          location_city: location.city
        })
        .eq('id', clickId)
        .select('id, ip, location_country, location_city')
        .single();
      return res;
    };

    let updateAttempt = await tryUpdate();
    if (updateAttempt.error) {
      console.warn('First update attempt failed:', updateAttempt.error);
      // Retry once after a short delay
      await new Promise(r => setTimeout(r, 500));
      updateAttempt = await tryUpdate();
    }

    if (updateAttempt.error) {
      console.error('Erreur mise à jour localisation après retry:', updateAttempt.error);
    } else {
      console.log('Localisation mise à jour:', updateAttempt.data || { ip, location });
    }

  } catch (error) {
    console.error('Erreur mise à jour arrière-plan:', error);
  }
};

// Fonction pour précharger les données géographiques (optionnel)
export const preloadGeolocationData = async () => {
  try {
    // Lancer en arrière-plan sans bloquer
    getClientIP().then(ip => {
      if (ip !== 'Inconnu') {
        getLocationFromIP(ip);
      }
    }).catch(() => {
      // Ignorer les erreurs de préchargement
    });
  } catch (error) {
    // Ignorer les erreurs de préchargement
  }
};

// Fonction pour nettoyer les caches (à appeler périodiquement)
export const clearLocationCaches = () => {
  ipCache.clear();
  locationCache.clear();
};