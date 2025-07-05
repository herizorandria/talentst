// Système optimisé de détection de bots avec redirections vers réseaux sociaux

export interface BotDetectionResult {
  isBot: boolean;
  botType: 'social' | 'crawler' | 'scraper' | 'unknown';
  confidence: number;
  redirectUrl?: string;
}

// Patterns de détection des bots (ultra-optimisés)
const BOT_PATTERNS = {
  // Bots des réseaux sociaux (patterns très spécifiques)
  social: [
    'facebookexternalhit', 'facebookcatalog', 'facebookbot',
    'twitterbot', 'twitter',
    'bytespider', 'bytedance', // TikTok bots uniquement
    'instagrambot', // Instagram bot spécifique
    'linkedinbot',
    'whatsappbot',
    'telegrambot',
    'discordbot',
    'snapbot',
    'pinterestbot',
    'slackbot'
  ],
  
  // Crawlers et scrapers (patterns essentiels)
  crawler: [
    'googlebot', 'bingbot', 'slurp', 'duckduckbot',
    'baiduspider', 'yandexbot',
    'crawler', 'spider', 'scraper', 'bot',
    'curl', 'wget', 'python-requests',
    'headlesschrome', 'phantomjs', 'selenium'
  ],
  
  // Autres bots suspects (patterns critiques)
  suspicious: [
    'python/', 'java/', 'go-http-client',
    'apache-httpclient', 'libwww-perl'
  ]
};

// URLs de redirection par type de bot
const REDIRECT_URLS = {
  facebook: 'https://www.facebook.com',
  twitter: 'https://www.twitter.com',
  tiktok: 'https://www.tiktok.com',
  instagram: 'https://www.instagram.com',
  linkedin: 'https://www.linkedin.com',
  whatsapp: 'https://web.whatsapp.com',
  telegram: 'https://web.telegram.org',
  discord: 'https://discord.com',
  snapchat: 'https://www.snapchat.com',
  pinterest: 'https://www.pinterest.com',
  default: 'https://www.google.com'
};

// Cache pour éviter les recalculs
const detectionCache = new Map<string, BotDetectionResult>();

export const detectBot = (userAgent?: string, additionalChecks = false): BotDetectionResult => {
  const ua = (userAgent || navigator.userAgent).toLowerCase();
  
  // Vérifier le cache d'abord
  if (detectionCache.has(ua)) {
    return detectionCache.get(ua)!;
  }
  
  // Score de confiance (0-100) - optimisé pour la vitesse
  let confidence = 0;
  let botType: 'social' | 'crawler' | 'scraper' | 'unknown' = 'unknown';
  let redirectUrl = REDIRECT_URLS.default;
  
  // Vérification ultra-rapide des patterns de bots sociaux
  for (const pattern of BOT_PATTERNS.social) {
    if (ua.includes(pattern)) {
      confidence = 98; // Très haute confiance pour les bots identifiés
      botType = 'social';
      
      // Déterminer l'URL de redirection spécifique (optimisé)
      if (pattern.includes('facebook')) redirectUrl = REDIRECT_URLS.facebook;
      else if (pattern.includes('twitter')) redirectUrl = REDIRECT_URLS.twitter;
      else if (pattern.includes('bytespider') || pattern.includes('bytedance')) redirectUrl = REDIRECT_URLS.tiktok;
      else if (pattern.includes('instagram')) redirectUrl = REDIRECT_URLS.instagram;
      else if (pattern.includes('linkedin')) redirectUrl = REDIRECT_URLS.linkedin;
      else if (pattern.includes('whatsapp')) redirectUrl = REDIRECT_URLS.whatsapp;
      else if (pattern.includes('telegram')) redirectUrl = REDIRECT_URLS.telegram;
      else if (pattern.includes('discord')) redirectUrl = REDIRECT_URLS.discord;
      else if (pattern.includes('snap')) redirectUrl = REDIRECT_URLS.snapchat;
      else if (pattern.includes('pinterest')) redirectUrl = REDIRECT_URLS.pinterest;
      
      break;
    }
  }
  
  // Vérification des crawlers (seulement si pas déjà détecté)
  if (confidence < 50) {
    for (const pattern of BOT_PATTERNS.crawler) {
      if (ua.includes(pattern)) {
        confidence = 90;
        botType = 'crawler';
        break;
      }
    }
  }
  
  // Vérifications supplémentaires (très limitées pour la performance)
  if (additionalChecks && confidence < 50 && typeof window !== 'undefined') {
    // Seulement les vérifications les plus critiques
    if ('webdriver' in navigator) confidence += 50;
    if ('_phantom' in window || '_selenium' in window) confidence += 60;
  }
  
  // Vérifications des patterns suspects (optimisé)
  if (confidence < 50) {
    for (const pattern of BOT_PATTERNS.suspicious) {
      if (ua.startsWith(pattern)) {
        confidence = 80;
        botType = 'scraper';
        break;
      }
    }
  }
  
  // User agents très courts (vérification rapide)
  if (confidence < 50 && ua.length < 15) confidence += 30;
  
  const isBot = confidence >= 75; // Seuil optimisé
  
  const result: BotDetectionResult = {
    isBot,
    botType,
    confidence: Math.min(100, confidence),
    redirectUrl: isBot ? redirectUrl : undefined
  };
  
  // Mettre en cache le résultat
  detectionCache.set(ua, result);
  
  // Nettoyer le cache après 5 minutes
  setTimeout(() => detectionCache.delete(ua), 5 * 60 * 1000);
  
  return result;
};

export const handleBotRedirect = (detection: BotDetectionResult, originalUrl: string) => {
  if (!detection.isBot || !detection.redirectUrl) return false;
  
  // Redirection immédiate pour les bots
  window.location.replace(detection.redirectUrl);
  return true;
};

// Fonction ultra-rapide pour tester l'interaction humaine
export const waitForHumanInteraction = (timeout = 3000): Promise<boolean> => {
  return new Promise((resolve) => {
    let resolved = false;
    const events = ['click', 'touchstart', 'keydown'];
    
    const handleInteraction = () => {
      if (!resolved) {
        resolved = true;
        cleanup();
        resolve(true);
      }
    };
    
    const cleanup = () => {
      events.forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
    };
    
    // Ajouter les listeners
    events.forEach(event => {
      document.addEventListener(event, handleInteraction, { once: true, passive: true });
    });
    
    // Timeout réduit
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        cleanup();
        resolve(false);
      }
    }, timeout);
  });
};

// Challenge ultra-rapide
export const createBotChallenge = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Challenge mathématique très simple
    const num1 = Math.floor(Math.random() * 3) + 1; // 1-3
    const num2 = Math.floor(Math.random() * 3) + 1; // 1-3
    const correctAnswer = num1 + num2;
    
    const userAnswer = prompt(`${num1} + ${num2} = ?`);
    
    if (userAnswer === null) {
      resolve(false);
    } else {
      resolve(parseInt(userAnswer) === correctAnswer);
    }
  });
};