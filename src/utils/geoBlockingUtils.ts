// Configuration des pays bloqués et utilitaires de géoblocage

export interface BlockedCountryConfig {
  country: string;
  aliases: string[];
  reason?: string;
}

// Liste des pays bloqués - facilement configurable
export const BLOCKED_COUNTRIES: BlockedCountryConfig[] = [
  {
    country: 'Madagascar',
    aliases: ['madagascar', 'malagasy', 'mg', 'mdg'],
    reason: 'Restrictions géographiques'
  },
  {
    country: 'Cuba',
    aliases: ['cuba', 'cu', 'cub'],
    reason: 'Restrictions géographiques'
  },
  {
    country: 'Iran',
    aliases: ['iran', 'ir', 'irn', 'islamic republic of iran'],
    reason: 'Restrictions géographiques'
  },
  {
    country: 'North Korea',
    aliases: ['north korea', 'kp', 'prk', 'democratic people\'s republic of korea'],
    reason: 'Restrictions géographiques'
  },
  // Ajouter d'autres pays selon les besoins
];

/**
 * Vérifie si un pays est dans la liste des pays bloqués
 */
export const isCountryBlocked = (countryName: string): boolean => {
  if (!countryName || countryName === 'Inconnu') {
    return false;
  }

  const normalizedCountry = countryName.toLowerCase().trim();
  
  return BLOCKED_COUNTRIES.some(blockedCountry => 
    blockedCountry.aliases.some(alias => 
      normalizedCountry.includes(alias) || alias.includes(normalizedCountry)
    )
  );
};

/**
 * Obtient les informations sur un pays bloqué
 */
export const getBlockedCountryInfo = (countryName: string): BlockedCountryConfig | null => {
  if (!countryName || countryName === 'Inconnu') {
    return null;
  }

  const normalizedCountry = countryName.toLowerCase().trim();
  
  return BLOCKED_COUNTRIES.find(blockedCountry => 
    blockedCountry.aliases.some(alias => 
      normalizedCountry.includes(alias) || alias.includes(normalizedCountry)
    )
  ) || null;
};

/**
 * Génère l'URL de redirection pour les pays bloqués
 */
export const getGeoBlockRedirectUrl = (): string => {
  return '/philosophical-quotes';
};

/**
 * Log de blocage géographique (pour analytics et monitoring)
 */
export const logGeoBlocking = (country: string, ip: string, shortCode?: string): void => {
  const logData = {
    timestamp: new Date().toISOString(),
    country,
    ip,
    shortCode,
    action: 'geo_blocked',
    userAgent: navigator.userAgent
  };
  
  console.log('Geo blocking event:', logData);
  
  // Ici on pourrait envoyer les logs à un service d'analytics
  // ou les stocker dans Supabase pour monitoring
};

/**
 * Vérifie si l'utilisateur doit être géobloqué et retourne l'action à prendre
 */
export interface GeoBlockingResult {
  isBlocked: boolean;
  country: string;
  redirectUrl?: string;
  reason?: string;
}

export const checkGeoBlocking = (country: string, ip: string = 'unknown'): GeoBlockingResult => {
  const isBlocked = isCountryBlocked(country);
  
  if (!isBlocked) {
    return {
      isBlocked: false,
      country
    };
  }

  const blockedCountryInfo = getBlockedCountryInfo(country);
  const redirectUrl = getGeoBlockRedirectUrl();
  
  // Log l'événement de blocage
  logGeoBlocking(country, ip);
  
  return {
    isBlocked: true,
    country,
    redirectUrl,
    reason: blockedCountryInfo?.reason || 'Restrictions géographiques'
  };
};

/**
 * Utilitaire pour ajouter/retirer des pays de la liste de blocage dynamiquement
 * (pour usage administrateur)
 */
export const addBlockedCountry = (country: string, aliases: string[], reason?: string): void => {
  const newBlockedCountry: BlockedCountryConfig = {
    country,
    aliases: aliases.map(alias => alias.toLowerCase()),
    reason
  };
  
  // Vérifier si le pays n'est pas déjà dans la liste
  const exists = BLOCKED_COUNTRIES.some(bc => 
    bc.country.toLowerCase() === country.toLowerCase()
  );
  
  if (!exists) {
    BLOCKED_COUNTRIES.push(newBlockedCountry);
    console.log(`Pays ajouté à la liste de blocage: ${country}`);
  }
};

export const removeBlockedCountry = (country: string): boolean => {
  const index = BLOCKED_COUNTRIES.findIndex(bc => 
    bc.country.toLowerCase() === country.toLowerCase()
  );
  
  if (index !== -1) {
    BLOCKED_COUNTRIES.splice(index, 1);
    console.log(`Pays retiré de la liste de blocage: ${country}`);
    return true;
  }
  
  return false;
};