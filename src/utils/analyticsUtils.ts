// Utilitaires pour détecter les informations du navigateur et de l'appareil

export interface DeviceInfo {
  browser: string;
  device: string;
  os: string;
}

export const detectDeviceInfo = (userAgent: string): DeviceInfo => {
  const ua = userAgent.toLowerCase();
  
  // Détection du navigateur
  let browser = 'Inconnu';
  if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('edg')) browser = 'Edge';
  else if (ua.includes('opera') || ua.includes('opr')) browser = 'Opera';
  else if (ua.includes('msie') || ua.includes('trident')) browser = 'Internet Explorer';
  
  // Détection de l'appareil
  let device = 'Desktop';
  if (ua.includes('mobile')) device = 'Mobile';
  else if (ua.includes('tablet') || ua.includes('ipad')) device = 'Tablet';
  
  // Détection de l'OS
  let os = 'Inconnu';
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac')) os = 'macOS';
  else if (ua.includes('linux')) os = 'Linux';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
  
  return { browser, device, os };
};

// Utiliser l'API ipify pour obtenir l'IP (HTTPS)
export const getClientIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.ip || 'Inconnu';
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'IP:', error);
    return 'Inconnu';
  }
};

// Utiliser ipapi.co (HTTPS et gratuit) pour la géolocalisation
export const getLocationFromIP = async (ip: string): Promise<{ country: string; city: string }> => {
  if (ip === 'Inconnu') {
    return { country: 'Inconnu', city: 'Inconnu' };
  }
  
  try {
    // Utiliser ipapi.co qui supporte HTTPS
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Vérifier si la réponse contient une erreur
    if (data.error) {
      console.warn('Erreur API géolocalisation:', data.reason);
      return { country: 'Inconnu', city: 'Inconnu' };
    }
    
    return {
      country: data.country_name || 'Inconnu',
      city: data.city || 'Inconnu'
    };
  } catch (error) {
    console.error('Erreur lors de la géolocalisation:', error);
    
    // Fallback vers une autre API HTTPS
    try {
      const fallbackResponse = await fetch(`https://api.country.is/${ip}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        return {
          country: fallbackData.country || 'Inconnu',
          city: 'Inconnu' // Cette API ne fournit que le pays
        };
      }
    } catch (fallbackError) {
      console.error('Erreur API fallback:', fallbackError);
    }
    
    return { country: 'Inconnu', city: 'Inconnu' };
  }
};

// Fonction optimisée pour enregistrer les clics avec gestion d'erreurs améliorée
export const recordClick = async (shortUrlId: string) => {
  try {
    const userAgent = navigator.userAgent;
    const deviceInfo = detectDeviceInfo(userAgent);
    const referrer = document.referrer || 'Direct';
    
    // Obtenir l'IP d'abord
    const ip = await getClientIP();
    console.log('IP récupérée:', ip);
    
    // Puis la géolocalisation
    const location = await getLocationFromIP(ip);
    console.log('Localisation récupérée:', location);
    
    const clickData = {
      short_url_id: shortUrlId,
      user_agent: userAgent,
      browser: deviceInfo.browser,
      device: deviceInfo.device,
      os: deviceInfo.os,
      referrer: referrer,
      ip: ip,
      location_country: location.country,
      location_city: location.city
    };
    
    console.log('Données à enregistrer:', clickData);
    
    // Envoyer les données à Supabase
    const { supabase } = await import('@/integrations/supabase/client');
    const { error } = await supabase
      .from('url_clicks')
      .insert(clickData);
    
    if (error) {
      console.error('Erreur lors de l\'enregistrement du clic:', error);
    } else {
      console.log('Clic enregistré avec succès');
    }
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du clic:', error);
  }
};

// Fonction pour tester les APIs de géolocalisation
export const testGeolocationAPIs = async () => {
  console.log('Test des APIs de géolocalisation...');
  
  try {
    const ip = await getClientIP();
    console.log('IP obtenue:', ip);
    
    const location = await getLocationFromIP(ip);
    console.log('Localisation obtenue:', location);
    
    return { ip, location };
  } catch (error) {
    console.error('Erreur lors du test:', error);
    return null;
  }
};