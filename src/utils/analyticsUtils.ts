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

// Utiliser l'API ipify pour obtenir l'IP
export const getClientIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'IP:', error);
    return 'Inconnu';
  }
};

// Utiliser l'API ip-api.com pour la géolocalisation (gratuite et rapide)
export const getLocationFromIP = async (ip: string): Promise<{ country: string; city: string }> => {
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return {
        country: data.country || 'Inconnu',
        city: data.city || 'Inconnu'
      };
    }
  } catch (error) {
    console.error('Erreur lors de la géolocalisation:', error);
  }
  
  return { country: 'Inconnu', city: 'Inconnu' };
};

// Fonction optimisée pour enregistrer les clics
export const recordClick = async (shortUrlId: string) => {
  try {
    const userAgent = navigator.userAgent;
    const deviceInfo = detectDeviceInfo(userAgent);
    const referrer = document.referrer || '';
    
    // Obtenir l'IP et la localisation en parallèle pour optimiser les performances
    const [ip, location] = await Promise.all([
      getClientIP(),
      getClientIP().then(ip => getLocationFromIP(ip))
    ]);
    
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
    
    // Envoyer les données à Supabase
    const { supabase } = await import('@/integrations/supabase/client');
    const { error } = await supabase
      .from('url_clicks')
      .insert(clickData);
    
    if (error) {
      console.error('Erreur lors de l\'enregistrement du clic:', error);
    }
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du clic:', error);
  }
};