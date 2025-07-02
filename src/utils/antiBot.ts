// Utilitaires pour éviter la détection par les bots des plateformes sociales

export const generateRandomDelay = (min: number = 300, max: number = 800): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const simulateHumanBehavior = (): Promise<void> => {
  return new Promise(resolve => {
    const delay = generateRandomDelay();
    setTimeout(resolve, delay);
  });
};

export const detectSocialMediaBot = (): boolean => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  const socialBotPatterns = [
    // Facebook
    'facebookexternalhit', 'facebookcatalog', 'facebookbot',
    // Twitter
    'twitterbot', 'twitter',
    // TikTok
    'tiktok', 'bytespider',
    // Instagram
    'instagram',
    // LinkedIn
    'linkedin', 'linkedinbot',
    // WhatsApp
    'whatsapp',
    // Telegram
    'telegram',
    // Discord
    'discord',
    // Snapchat
    'snapchat',
    // Pinterest
    'pinterest',
    // Autres bots courants
    'bot', 'crawler', 'spider', 'scraper'
  ];
  
  return socialBotPatterns.some(pattern => userAgent.includes(pattern));
};

export const createSafeRedirectUrl = (originalUrl: string, shortCode: string): string => {
  // Créer une URL de redirection qui semble légitime pour les bots
  const baseUrl = window.location.origin;
  return `${baseUrl}/${shortCode}`;
};

export const generateSafeMetaTags = (originalUrl: string, description?: string) => {
  const domain = new URL(originalUrl).hostname;
  
  return {
    title: description || `Contenu partagé depuis ${domain}`,
    description: `Cliquez pour voir le contenu complet sur ${domain}`,
    image: 'https://via.placeholder.com/1200x630/4F46E5/FFFFFF?text=Contenu+Sécurisé',
    type: 'website'
  };
};

export const addRandomMouseMovement = (): void => {
  // Simuler des mouvements de souris pour paraître plus humain
  const moveCount = Math.floor(Math.random() * 3) + 1;
  
  for (let i = 0; i < moveCount; i++) {
    setTimeout(() => {
      const event = new MouseEvent('mousemove', {
        clientX: Math.random() * window.innerWidth,
        clientY: Math.random() * window.innerHeight
      });
      document.dispatchEvent(event);
    }, Math.random() * 1000);
  }
};

export const createDecoyContent = (originalUrl: string) => {
  const domain = new URL(originalUrl).hostname;
  
  return {
    headline: `Découvrez ce contenu intéressant`,
    summary: `Un contenu partagé depuis ${domain} qui pourrait vous intéresser.`,
    callToAction: 'Cliquer pour voir plus'
  };
};

// Fonction pour retarder la redirection et éviter la détection automatique
export const delayedRedirect = (url: string, delay: number = 2000): void => {
  // Ajouter des interactions simulées
  addRandomMouseMovement();
  
  setTimeout(() => {
    // Utiliser replace pour éviter l'historique
    window.location.replace(url);
  }, delay);
};

// Vérifier si l'utilisateur interagit vraiment
export const waitForUserInteraction = (): Promise<void> => {
  return new Promise(resolve => {
    const events = ['click', 'touchstart', 'keydown', 'mousemove'];
    
    const handleInteraction = () => {
      events.forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
      resolve();
    };
    
    events.forEach(event => {
      document.addEventListener(event, handleInteraction, { once: true });
    });
    
    // Timeout après 10 secondes si aucune interaction
    setTimeout(() => {
      events.forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
      resolve();
    }, 10000);
  });
};