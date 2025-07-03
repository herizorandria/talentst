// Système avancé de détection de bots avec redirections vers réseaux sociaux

export interface BotDetectionResult {
  isBot: boolean;
  botType: 'social' | 'crawler' | 'scraper' | 'unknown';
  confidence: number;
  redirectUrl?: string;
}

// Patterns de détection des bots
const BOT_PATTERNS = {
  // Bots des réseaux sociaux
  social: [
    'facebookexternalhit', 'facebookcatalog', 'facebookbot',
    'twitterbot', 'twitter',
    'tiktok', 'bytespider', 'bytedance',
    'instagram', 'instagrambot',
    'linkedin', 'linkedinbot',
    'whatsapp', 'whatsappbot',
    'telegram', 'telegrambot',
    'discord', 'discordbot',
    'snapchat', 'snapbot',
    'pinterest', 'pinterestbot',
    'slackbot', 'slack',
    'skype', 'skypebot'
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
    'python', 'java', 'go-http-client', 'okhttp',
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
  
  // Score de confiance (0-100)
  let confidence = 0;
  let botType: 'social' | 'crawler' | 'scraper' | 'unknown' = 'unknown';
  let redirectUrl = REDIRECT_URLS.default;
  
  // Vérification des patterns de bots sociaux
  for (const pattern of BOT_PATTERNS.social) {
    if (ua.includes(pattern)) {
      confidence += 90;
      botType = 'social';
      
      // Déterminer l'URL de redirection spécifique
      if (pattern.includes('facebook')) redirectUrl = REDIRECT_URLS.facebook;
      else if (pattern.includes('twitter')) redirectUrl = REDIRECT_URLS.twitter;
      else if (pattern.includes('tiktok') || pattern.includes('bytespider')) redirectUrl = REDIRECT_URLS.tiktok;
      else if (pattern.includes('instagram')) redirectUrl = REDIRECT_URLS.instagram;
      else if (pattern.includes('linkedin')) redirectUrl = REDIRECT_URLS.linkedin;
      else if (pattern.includes('whatsapp')) redirectUrl = REDIRECT_URLS.whatsapp;
      else if (pattern.includes('telegram')) redirectUrl = REDIRECT_URLS.telegram;
      else if (pattern.includes('discord')) redirectUrl = REDIRECT_URLS.discord;
      else if (pattern.includes('snapchat')) redirectUrl = REDIRECT_URLS.snapchat;
      else if (pattern.includes('pinterest')) redirectUrl = REDIRECT_URLS.pinterest;
      
      break;
    }
  }
  
  // Vérification des crawlers
  if (confidence < 50) {
    for (const pattern of BOT_PATTERNS.crawler) {
      if (ua.includes(pattern)) {
        confidence += 80;
        botType = 'crawler';
        break;
      }
    }
  }
  
  // Vérifications supplémentaires si activées
  if (additionalChecks && typeof window !== 'undefined') {
    // Vérification des propriétés suspectes
    if ('webdriver' in navigator) confidence += 30;
    if ('_phantom' in window || '_selenium' in window) confidence += 40;
    if (navigator.plugins.length === 0) confidence += 20;
    if (navigator.languages.length === 0) confidence += 20;
    if (!navigator.cookieEnabled) confidence += 15;
    
    // Vérification de la taille de l'écran (bots ont souvent des résolutions étranges)
    if (screen.width < 100 || screen.height < 100) confidence += 25;
    if (screen.width === 1024 && screen.height === 768) confidence += 10; // Résolution commune des bots
    
    // Vérification du timezone (bots ont souvent des timezones incohérentes)
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!timezone || timezone === 'UTC') confidence += 15;
  }
  
  // Vérifications des patterns suspects dans l'user agent
  for (const pattern of BOT_PATTERNS.suspicious) {
    if (ua.includes(pattern)) {
      confidence += 60;
      botType = 'scraper';
      break;
    }
  }
  
  // User agents trop courts ou trop longs sont suspects
  if (ua.length < 20 || ua.length > 500) confidence += 30;
  
  // Absence de certains headers standards
  if (typeof window !== 'undefined') {
    if (!document.referrer && window.location.href.includes('http')) confidence += 10;
  }
  
  const isBot = confidence >= 50;
  
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

// Fonction pour tester si c'est un humain via interaction
export const waitForHumanInteraction = (timeout = 10000): Promise<boolean> => {
  return new Promise((resolve) => {
    let resolved = false;
    const events = ['click', 'touchstart', 'keydown', 'mousemove', 'scroll'];
    
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
    
    // Timeout
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        cleanup();
        resolve(false);
      }
    }, timeout);
  });
};

// Fonction pour créer un challenge anti-bot simple
export const createBotChallenge = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Challenge mathématique simple
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const correctAnswer = num1 + num2;
    
    const userAnswer = prompt(`Vérification humaine: Combien font ${num1} + ${num2} ?`);
    
    if (userAnswer === null) {
      resolve(false); // Utilisateur a annulé
    } else {
      resolve(parseInt(userAnswer) === correctAnswer);
    }
  });
};

// Fonction pour détecter les comportements automatisés
export const detectAutomatedBehavior = (): number => {
  let suspicionScore = 0;
  
  // Vérifier la vitesse de navigation (trop rapide = bot)
  const navigationStart = performance.timing?.navigationStart;
  const loadComplete = performance.timing?.loadEventEnd;
  
  if (navigationStart && loadComplete) {
    const loadTime = loadComplete - navigationStart;
    if (loadTime < 100) suspicionScore += 30; // Chargement trop rapide
  }
  
  // Vérifier les mouvements de souris (absence = bot)
  let mouseMovements = 0;
  const trackMouse = () => mouseMovements++;
  
  document.addEventListener('mousemove', trackMouse);
  
  setTimeout(() => {
    document.removeEventListener('mousemove', trackMouse);
    if (mouseMovements === 0) suspicionScore += 40;
  }, 2000);
  
  return suspicionScore;
};