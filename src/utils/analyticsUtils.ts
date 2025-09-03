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
const locationCache = new Map<string, { country: string; city: string }>();

// Petit helper pour fetch avec timeout et parsing JSON
const fetchJsonWithTimeout = async (url: string, timeoutMs = 4000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
    clearTimeout(id);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
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
    try {
      const data = await fetchJsonWithTimeout(p.url, 4000);
      const ip = p.pick(data) || (data && data.ip) || 'Inconnu';
      if (ip && ip !== 'Inconnu') {
        // Mettre en cache pour 5 minutes
        ipCache.set(cacheKey, ip);
        setTimeout(() => ipCache.delete(cacheKey), 5 * 60 * 1000);
        return ip;
      }
    } catch (err) {
      // Ignore et passe au provider suivant
      console.warn('getClientIP provider failed:', p.url, err);
    }
  }

  return 'Inconnu';
};

// Fonction ultra-rapide pour la géolocalisation avec cache et fallback
export const getLocationFromIP = async (ip: string): Promise<{ country: string; city: string }> => {
  if (ip === 'Inconnu') {
    return { country: 'Inconnu', city: 'Inconnu' };
  }

  // Vérifier le cache d'abord
  if (locationCache.has(ip)) {
    return locationCache.get(ip)!;
  }

  type LocationProvider = { url: string; pick: (data: unknown) => { country?: string; city?: string } | undefined };
  const providers: LocationProvider[] = [
    { url: `https://ipapi.co/${ip}/json/`, pick: (d) => { const r = toRecord(d); return r ? { country: typeof r.country_name === 'string' ? r.country_name as string : undefined, city: typeof r.city === 'string' ? r.city as string : undefined } : undefined; } },
    { url: `https://ipwhois.app/json/${ip}`, pick: (d) => { const r = toRecord(d); return r ? { country: typeof r.country === 'string' ? r.country as string : undefined, city: typeof r.city === 'string' ? r.city as string : undefined } : undefined; } },
    { url: `https://ipapi.co/${ip}/country_name/`, pick: (d) => { const r = toRecord(d); return r ? { country: String(r).trim(), city: 'Inconnu' } : undefined; } },
  ];

  for (const p of providers) {
    try {
      const data = await fetchJsonWithTimeout(p.url, 4000);
      const pick = p.pick(data);
      const country = (pick?.country && String(pick.country).trim()) || 'Inconnu';
      const city = (pick?.city && String(pick.city).trim()) || 'Inconnu';

      const location = { country, city };
      // Cache pour 1 heure
      locationCache.set(ip, location);
      setTimeout(() => locationCache.delete(ip), 60 * 60 * 1000);
      return location;
    } catch (err) {
      console.warn('getLocationFromIP provider failed:', p.url, err);
    }
  }

  return { country: 'Inconnu', city: 'Inconnu' };
};

// Fonction optimisée pour enregistrer les clics en arrière-plan
export const recordClick = async (shortUrlId: string) => {
  // Enregistrer immédiatement les données de base sans attendre les APIs
  const userAgent = navigator.userAgent;
  const deviceInfo = detectDeviceInfo(userAgent);
  const referrer = document.referrer || 'Direct';
  
  // Données de base à enregistrer immédiatement
  const baseClickData = {
    short_url_id: shortUrlId,
    user_agent: userAgent,
    browser: deviceInfo.browser,
    device: deviceInfo.device,
    os: deviceInfo.os,
    referrer: referrer,
    ip: 'En cours...',
    location_country: 'En cours...',
    location_city: 'En cours...'
  };
  
  try {
    // Enregistrer immédiatement avec des données partielles
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
    
    const clickId = insertedData.id;
    
    // Mettre à jour en arrière-plan avec les données géographiques
    updateLocationDataInBackground(clickId);
    
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
    const { error: updateError } = await supabase
      .from('url_clicks')
      .update({
        ip: ip,
        location_country: location.country,
        location_city: location.city
      })
      .eq('id', clickId);

    if (updateError) {
      console.error('Erreur mise à jour localisation:', updateError);
    } else {
      console.log('Localisation mise à jour:', { ip, location });
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