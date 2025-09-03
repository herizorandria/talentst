import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ShortenedUrl } from '@/types/url';
import { ExternalLink, AlertCircle, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { isUrlExpired } from '@/utils/urlUtils';
import { recordClick, preloadGeolocationData, getClientIP, getLocationFromIP } from '@/utils/analyticsUtils';
import { detectBot } from '@/utils/botDetection';
import BotDetection from '@/components/BotDetection';
import MetaTagsGenerator from '@/components/MetaTagsGenerator';

// --- IP / CIDR helpers (lightweight, IPv4 focused) ---
const ipV4ToLong = (ip: string): number | null => {
  try {
    const parts = ip.trim().split('.').map(p => parseInt(p, 10));
    if (parts.length !== 4 || parts.some(p => Number.isNaN(p) || p < 0 || p > 255)) return null;
    return ((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
  } catch (e) {
    return null;
  }
};

const cidrContains = (cidr: string, ip: string): boolean => {
  // Expect cidr like "192.168.0.0/24"
  const [base, prefixStr] = cidr.split('/');
  if (!base || !prefixStr) return false;
  const prefix = parseInt(prefixStr, 10);
  if (Number.isNaN(prefix) || prefix < 0 || prefix > 32) return false;

  const ipLong = ipV4ToLong(ip);
  const baseLong = ipV4ToLong(base);
  if (ipLong === null || baseLong === null) return false;

  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  return (ipLong & mask) === (baseLong & mask);
};

const isIpBlocked = (blockedList: string[] | undefined, clientIp: string): boolean => {
  if (!blockedList || !clientIp) return false;
  const candidate = clientIp.trim();
  for (const raw of blockedList) {
    if (!raw) continue;
    const item = raw.trim();
    // CIDR range
    if (item.includes('/')) {
      if (cidrContains(item, candidate)) return true;
      continue;
    }
    // Exact match (IPv4 or IPv6) - compare trimmed
    if (item === candidate) return true;
  }
  return false;
};

const Redirect: React.FC = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [url, setUrl] = useState<ShortenedUrl | null>(null);
  const [loading, setLoading] = useState(true);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showBotDetection, setShowBotDetection] = useState(false);
  const [humanVerified, setHumanVerified] = useState(false);

  const updateClickStatsAsync = useCallback(async (shortCodeParam?: string) => {
    try {
      await supabase.rpc('increment_url_clicks', {
        p_short_code: shortCodeParam || shortCode || ''
      });
    } catch (err) {
      console.error('Erreur mise à jour stats:', err);
    }
  }, [shortCode]);

  useEffect(() => {
    if (!shortCode) {
      setLoading(false);
      return;
    }

    preloadGeolocationData();

    const loadAndValidateUrl = async () => {
      try {
        const botDetection = detectBot();

        if (botDetection.isBot && botDetection.confidence > 95) {
          if (botDetection.redirectUrl) {
            window.location.replace(botDetection.redirectUrl);
            return;
          }
        }

        const { data, error } = await supabase
          .rpc('get_redirect_url', { p_code: shortCode })
          .single();

        if (error || !data) {
          setUrl(null);
          setLoading(false);
          return;
        }

        type RpcUrlData = {
          id: string;
          original_url?: string;
          direct_link?: boolean;
          expires_at?: string;
          requires_password?: boolean;
          description?: string;
          blocked_countries?: string[];
          blocked_ips?: string[];
          is_blocked?: boolean;
        };
        const d = data as RpcUrlData;
        const foundUrl: ShortenedUrl = {
          id: data.id,
          originalUrl: data.original_url || '',
          shortCode: shortCode || '',
          customCode: undefined,
          createdAt: new Date(),
          clicks: 0,
          description: d.description || undefined,
          password: data.requires_password ? 'protected' : undefined,
          expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
          directLink: data.direct_link || false,
          blockedCountries: d.blocked_countries || undefined,
          blockedIPs: d.blocked_ips || undefined,
        };

        if (isUrlExpired(foundUrl.expiresAt)) {
          setUrl(null);
          setLoading(false);
          return;
        }

        // If server reports the URL as blocked (IP-based enforcement), stop here
        if ((d.is_blocked ?? false) === true) {
          window.location.href = '/philosophical-quotes';
          return;
        }

        setUrl(foundUrl);

        try {
          // Resolve client IP and location with a more reliable fallback
          const resolveIpAndLocation = async (): Promise<{ ip: string; country: string; city: string }> => {
            try {
              const ip = await getClientIP();
              if (ip && ip !== 'Inconnu') {
                const loc = await getLocationFromIP(ip);
                return { ip, country: loc.country || 'Inconnu', city: loc.city || 'Inconnu' };
              }
            } catch (e) {
              // continue to fallback
            }

            // Fallback: try ipapi.co without IP (returns caller info)
            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 3000);
              const resp = await fetch('https://ipapi.co/json/', { signal: controller.signal, headers: { Accept: 'application/json' } });
              clearTimeout(timeoutId);
              if (resp.ok) {
                const j = await resp.json();
                return { ip: j.ip || 'Inconnu', country: j.country_name || 'Inconnu', city: j.city || 'Inconnu' };
              }
            } catch (e) {
              // ignore
            }

            return { ip: 'Inconnu', country: 'Inconnu', city: 'Inconnu' };
          };

          const { ip: resolvedIp, country: resolvedCountry, city: resolvedCity } = await resolveIpAndLocation();

          // IP-based blocking (supports exact IPs and CIDR ranges via isIpBlocked)
          if (foundUrl.blockedIPs && foundUrl.blockedIPs.length > 0 && resolvedIp && resolvedIp !== 'Inconnu') {
            const ipBlocked = isIpBlocked(foundUrl.blockedIPs, resolvedIp);
            if (ipBlocked) {
              window.location.href = '/philosophical-quotes';
              return;
            }
          }

          // Country-based blocking (robust lowercase matching)
          if (foundUrl.blockedCountries && foundUrl.blockedCountries.length > 0 && resolvedCountry && resolvedCountry !== 'Inconnu') {
            const normalizedCountry = resolvedCountry.toLowerCase().trim();
            const isCountryInList = foundUrl.blockedCountries
              .map((c: string) => String(c).toLowerCase().trim())
              .some((c: string) => normalizedCountry.includes(c) || c.includes(normalizedCountry));
            if (isCountryInList) {
              window.location.href = '/philosophical-quotes';
              return;
            }
          }
        } catch (err) {
          console.warn('Erreur vérification géolocalisation:', err);
        }

        // If the URL requires a password, show the password flow.
        if (foundUrl.password) {
          setPasswordRequired(true);
          setLoading(false);
          return;
        }

        // Immediate redirect for all non-password URLs (no landing page),
        // regardless of `directLink` flag. This bypasses the landing/modal
        // and bot-detection UI so users are taken directly to the original URL.
        try {
          recordClick(foundUrl.id);
          updateClickStatsAsync(foundUrl.shortCode);
        } catch (err) {
          // Logging only; failure to record stats shouldn't block redirect
          console.warn('Failed to record click before redirect:', err);
        }

        window.location.href = foundUrl.originalUrl;
        return;

      } catch (err) {
        console.error('Erreur lors de la récupération de l\'URL:', err);
      }

      setLoading(false);
    };

    loadAndValidateUrl();
  }, [shortCode, updateClickStatsAsync]);

  const handleHumanVerified = async () => {
    setHumanVerified(true);
    setShowBotDetection(false);

    if (!url) return;

    recordClick(url.id);
    updateClickStatsAsync(url.shortCode);
    window.location.href = url.originalUrl;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url || !url.password) return;

    try {
      const { data, error } = await supabase
        .rpc('get_redirect_url', { p_code: shortCode || '', p_password: enteredPassword })
        .single();

      if (error || !data || !data.original_url) {
        setPasswordError('Mot de passe incorrect');
        return;
      }

      const updatedUrl = { ...url, originalUrl: data.original_url };
      setUrl(updatedUrl);

      setPasswordRequired(false);
      setPasswordError('');

      const botDetection = detectBot();
      if (botDetection.isBot && botDetection.confidence > 90 && botDetection.redirectUrl) {
        window.location.replace(botDetection.redirectUrl);
        return;
      }

      recordClick(url.id);
      updateClickStatsAsync(url.shortCode);

      if (data.direct_link) {
        window.location.href = data.original_url;
      } else {
        setShowBotDetection(false);
        setHumanVerified(true);
        recordClick(url.id);
        updateClickStatsAsync(url.shortCode);
        window.location.href = data.original_url;
      }
    } catch (err) {
      setPasswordError('Erreur de vérification');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-100">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification...</p>
        </div>
      </div>
    );
  }

  if (!url) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-100 p-4">
        <Card className="max-w-md w-full shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-6 w-6" />
              Lien introuvable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Le lien court <code className="bg-gray-100 px-2 py-1 rounded">{shortCode}</code> n'existe pas ou a expiré.
            </p>
            <Button onClick={() => window.location.href = '/'} className="w-full" variant="outline">Retour à l'accueil</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const shortUrl = `${window.location.origin}/${shortCode}`;

  if (passwordRequired) {
    return (
      <>
        <MetaTagsGenerator url={url} shortUrl={shortUrl} />
        <div className="min-h-screen flex items-center justify-center bg-yellow-100 p-4">
          <Card className="max-w-md w-full shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600"><Shield className="h-6 w-6" />Lien protégé</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <p className="text-gray-600">Ce lien est protégé par un mot de passe.</p>
                <div>
                  <Input type="password" placeholder="Mot de passe" value={enteredPassword} onChange={(e) => setEnteredPassword(e.target.value)} className="w-full" autoFocus />
                  {passwordError && <p className="text-red-600 text-sm mt-1">{passwordError}</p>}
                </div>
                <div className="space-y-2">
                  <Button type="submit" className="w-full">Accéder</Button>
                  <Button onClick={() => window.location.href = '/'} variant="outline" className="w-full">Annuler</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (showBotDetection && !humanVerified) {
    return (
      <>
        <MetaTagsGenerator url={url} shortUrl={shortUrl} />
        <BotDetection originalUrl={url.originalUrl} shortCode={shortCode!} onHumanVerified={() => { handleHumanVerified(); }} />
      </>
    );
  }

  return (
    <>
      <MetaTagsGenerator url={url} shortUrl={shortUrl} />
      <div className="min-h-screen flex items-center justify-center bg-green-100 p-4">
        <Card className="max-w-md w-full shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600"><ExternalLink className="h-6 w-6" />Redirection en cours...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-600">Redirection vers :</p>
              <div className="p-3 bg-gray-100 rounded-lg"><p className="text-sm break-all text-gray-800">{url?.originalUrl}</p></div>
              <div className="space-y-2">
                <Button onClick={() => { recordClick(url.id); updateClickStatsAsync(url.shortCode); window.location.href = url.originalUrl; }} className="w-full bg-green-600 hover:bg-green-700">Y aller maintenant</Button>
                <Button onClick={() => window.location.href = '/'} variant="outline" className="w-full">Annuler</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Redirect;