// Système avancé de détection de bots avec redirections vers réseaux sociaux

export interface BotDetectionResult {
  isBot: boolean;
  botType: 'social' | 'crawler' | 'scraper' | 'unknown';
  confidence: number;
  redirectUrl?: string;
}

// Patterns de détection des bots (plus précis)
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
  
  // Crawlers et scrapers
  crawler: [
    'googlebot', 'bingbot', 'slurp', 'duckduckbot',
    'baiduspider', 'yandexbot', 'sogou', 'exabot',
    'crawler', 'spider', 'scraper', 'bot',
    'curl', 'wget', 'python-requests', 'node-fetch',
    'headlesschrome', 'phantomjs', 'selenium'
  ],
  
  // Autres bots suspects
  suspicious: [
    'python/', 'java/', 'go-http-client', 'okhttp',
    'apache-httpclient', 'libwww-perl', 'lwp-trivial'
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

export const detectBot = (userAgent?: string, additionalChecks = true): BotDetectionResult => {
  const ua = (userAgent || navigator.userAgent).toLowerCase();
  
  // Score de confiance (0-100) - plus strict pour éviter les faux positifs
  let confidence = 0;
  let botType: 'social' | 'crawler' | 'scraper' | 'unknown' = 'unknown';
  let redirectUrl = REDIRECT_URLS.default;
  
  // Vérification des patterns de bots sociaux (très spécifiques)
  for (const pattern of BOT_PATTERNS.social) {
    if (ua.includes(pattern)) {
      confidence += 95; // Très haute confiance pour les bots identifiés
      botType = 'social';
      
      // Déterminer l'URL de redirection spécifique
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
  
  // Vérification des crawlers (seulement si pas déjà détecté comme bot social)
  if (confidence < 50) {
    for (const pattern of BOT_PATTERNS.crawler) {
      if (ua.includes(pattern)) {
        confidence += 85;
        botType = 'crawler';
        break;
      }
    }
  }
  
  // Vérifications supplémentaires (plus conservatrices)
  if (additionalChecks && typeof window !== 'undefined') {
    // Vérifications très spécifiques aux bots
    if ('webdriver' in navigator) confidence += 40;
    if ('_phantom' in window || '_selenium' in window) confidence += 50;
    
    // Vérifications moins agressives pour éviter les faux positifs
    if (navigator.plugins.length === 0 && navigator.userAgent.includes('HeadlessChrome')) confidence += 30;
    if (!navigator.cookieEnabled && ua.includes('bot')) confidence += 20;
    
    // Résolutions très suspectes (pas les résolutions mobiles normales)
    if ((screen.width < 100 || screen.height < 100) && screen.width !== 0) confidence += 30;
    if (screen.width === 1024 && screen.height === 768 && ua.includes('bot')) confidence += 15;
  }
  
  // Vérifications des patterns suspects dans l'user agent (plus strict)
  for (const pattern of BOT_PATTERNS.suspicious) {
    if (ua.startsWith(pattern)) { // Utiliser startsWith pour être plus précis
      confidence += 70;
      botType = 'scraper';
      break;
    }
  }
  
  // User agents très courts ou sans version (plus spécifique)
  if (ua.length < 15 || (ua.length > 500 && ua.includes('bot'))) confidence += 25;
  
  // Seuil plus élevé pour éviter les faux positifs
  const isBot = confidence >= 70; // Augmenté de 50 à 70
  
  return {
    isBot,
    botType,
    confidence: Math.min(100, confidence),
    redirectUrl: isBot ? redirectUrl : undefined
  };
};

export const handleBotRedirect = (detection: BotDetectionResult, originalUrl: string) => {
  if (!detection.isBot || !detection.redirectUrl) return false;
  
  // Log pour analytics (optionnel)
  console.log(`Bot détecté (${detection.botType}, confiance: ${detection.confidence}%) - Redirection vers ${detection.redirectUrl}`);
  
  // Redirection immédiate pour les bots
  window.location.replace(detection.redirectUrl);
  return true;
};

// Fonction pour tester si c'est un humain via interaction (plus rapide)
export const waitForHumanInteraction = (timeout = 5000): Promise<boolean> => {
  return new Promise((resolve) => {
    let resolved = false;
    const events = ['click', 'touchstart', 'keydown', 'mousemove'];
    
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

// Fonction pour créer un challenge anti-bot simple (plus rapide)
export const createBotChallenge = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Challenge mathématique simple
    const num1 = Math.floor(Math.random() * 5) + 1; // Nombres plus petits
    const num2 = Math.floor(Math.random() * 5) + 1;
    const correctAnswer = num1 + num2;
    
    const userAnswer = prompt(`Vérification: ${num1} + ${num2} = ?`);
    
    if (userAnswer === null) {
      resolve(false); // Utilisateur a annulé
    } else {
      resolve(parseInt(userAnswer) === correctAnswer);
    }
  });
};

// Fonction optimisée pour détecter les comportements automatisés
export const detectAutomatedBehavior = (): number => {
  let suspicionScore = 0;
  
  // Vérifier la vitesse de navigation (plus tolérant)
  const navigationStart = performance.timing?.navigationStart;
  const loadComplete = performance.timing?.loadEventEnd;
  
  if (navigationStart && loadComplete) {
    const loadTime = loadComplete - navigationStart;
    if (loadTime < 50) suspicionScore += 20; // Seuil réduit
  }
  
  return suspicionScore;
};