// Utilitaires optimisés pour détecter les informations du navigateur et de l'appareil

export interface DeviceInfo {
  browser: string;
  device: string;
  os: string;
}

export const detectDeviceInfo = (userAgent: string): DeviceInfo => {
  const ua = userAgent.toLowerCase();
  
  // Détection du navigateur (optimisée)
  let browser = 'Inconnu';
  if (ua.includes('edg')) browser = 'Edge';
  else if (ua.includes('chrome')) browser = 'Chrome';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('safari')) browser = 'Safari';
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

// Fonction ultra-rapide pour obtenir l'IP avec cache et timeout court
export const getClientIP = async (): Promise<string> => {
  const cacheKey = 'current_ip';
  
  // Vérifier le cache d'abord
  if (ipCache.has(cacheKey)) {
    return ipCache.get(cacheKey)!;
  }
  
  try {
    // Timeout très court pour éviter les blocages
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 secondes max
    
    const response = await fetch('https://api.ipify.org?format=json', {
      method: 'GET',
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    const ip = data.ip || 'Inconnu';
    
    // Mettre en cache pour 5 minutes
    ipCache.set(cacheKey, ip);
    setTimeout(() => ipCache.delete(cacheKey), 5 * 60 * 1000);
    
    return ip;
  } catch (error) {
    console.warn('IP rapide échouée, utilisation fallback:', error);
    return 'Inconnu';
  }
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
  
  try {
    // Timeout très court
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5 secondes max
    
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      method: 'GET',
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.reason || 'API Error');
    }
    
    const location = {
      country: data.country_name || 'Inconnu',
      city: data.city || 'Inconnu'
    };
    
    // Mettre en cache pour 1 heure
    locationCache.set(ip, location);
    setTimeout(() => locationCache.delete(ip), 60 * 60 * 1000);
    
    return location;
  } catch (error) {
    console.warn('Géolocalisation rapide échouée:', error);
    
    // Fallback ultra-rapide (pays seulement)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000); // 1 seconde max
      
      const fallbackResponse = await fetch(`https://api.country.is/${ip}`, {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      
      clearTimeout(timeoutId);
      
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        const location = {
          country: fallbackData.country || 'Inconnu',
          city: 'Inconnu'
        };
        
        // Cache même le fallback
        locationCache.set(ip, location);
        setTimeout(() => locationCache.delete(ip), 30 * 60 * 1000);
        
        return location;
      }
    } catch (fallbackError) {
      console.warn('Fallback géolocalisation échoué:', fallbackError);
    }
    
    return { country: 'Inconnu', city: 'Inconnu' };
  }
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
    // Obtenir l'IP et la localisation en parallèle avec Promise.allSettled
    const [ipResult, ] = await Promise.allSettled([
      getClientIP()
    ]);
    
    const ip = ipResult.status === 'fulfilled' ? ipResult.value : 'Inconnu';
    
    // Obtenir la localisation seulement si on a une IP valide
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