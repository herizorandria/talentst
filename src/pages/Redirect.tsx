import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShortenedUrl } from '@/types/url';
import { ExternalLink, AlertCircle, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { verifyPassword } from '@/utils/securityUtils';
import { isUrlExpired } from '@/utils/urlUtils';
import { recordClick } from '@/utils/analyticsUtils';
import { detectBot, handleBotRedirect } from '@/utils/botDetection';
import BotDetection from '@/components/BotDetection';
import MetaTagsGenerator from '@/components/MetaTagsGenerator';

const Redirect = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [url, setUrl] = useState<ShortenedUrl | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(3); // Réduit à 3 secondes
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showBotDetection, setShowBotDetection] = useState(false);
  const [humanVerified, setHumanVerified] = useState(false);

  useEffect(() => {
    if (!shortCode) {
      setLoading(false);
      return;
    }

    const loadAndValidateUrl = async () => {
      try {
        // Détecter les bots avant tout traitement (seuils plus élevés)
        const botDetection = detectBot();
        console.log('Bot detection result:', botDetection);
        
        // Si c'est un bot avec très haute confiance, rediriger immédiatement
        if (botDetection.isBot && botDetection.confidence > 90) {
          console.log(`Bot détecté: ${botDetection.botType} (${botDetection.confidence}%) - Redirection vers ${botDetection.redirectUrl}`);
          
          // Redirection immédiate pour les bots
          if (botDetection.redirectUrl) {
            window.location.replace(botDetection.redirectUrl);
            return;
          }
        }

        // Chercher le lien dans la base Supabase
        const { data, error } = await supabase
          .from('shortened_urls')
          .select('*')
          .or(`short_code.eq.${shortCode},custom_code.eq.${shortCode}`)
          .limit(1)
          .single();

        if (error || !data) {
          setUrl(null);
          setLoading(false);
          return;
        }

        // Adapter le format pour ShortenedUrl
        const foundUrl: ShortenedUrl = {
          id: data.id,
          originalUrl: data.original_url,
          shortCode: data.short_code,
          customCode: data.custom_code || undefined,
          createdAt: new Date(data.created_at),
          clicks: data.clicks,
          lastClickedAt: data.last_clicked_at ? new Date(data.last_clicked_at) : undefined,
          description: data.description || undefined,
          tags: data.tags || undefined,
          password: data.password_hash || undefined,
          expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
          directLink: data.direct_link || false
        };

        // Check if URL has expired
        if (isUrlExpired(foundUrl.expiresAt)) {
          setUrl(null);
          setLoading(false);
          return;
        }

        setUrl(foundUrl);

        // Check if password is required
        if (foundUrl.password) {
          setPasswordRequired(true);
          setLoading(false);
          return;
        }

        // Pour les liens directs, vérifier quand même les bots mais rediriger plus vite
        if (foundUrl.directLink) {
          if (botDetection.isBot && botDetection.confidence > 80) {
            // Bot détecté sur lien direct - rediriger vers réseau social
            if (botDetection.redirectUrl) {
              window.location.replace(botDetection.redirectUrl);
              return;
            }
          }
          
          // Lien direct pour humain - redirection rapide
          setShowBotDetection(false);
          setHumanVerified(true);
          
          // Enregistrer le clic et rediriger
          await recordClick(foundUrl.id);
          await updateClickStats(foundUrl.id);
          
          setTimeout(() => {
            window.location.href = foundUrl.originalUrl;
          }, 300); // Réduit à 300ms
          return;
        }

        // Pour les liens normaux, vérifier si on doit montrer la détection de bot
        if (botDetection.isBot && botDetection.confidence > 70) {
          setShowBotDetection(true);
        } else {
          // Utilisateur humain probable - passer directement au countdown
          setShowBotDetection(false);
          setHumanVerified(true);
        }

      } catch (error) {
        console.error('Erreur lors de la récupération de l\'URL:', error);
      }
      setLoading(false);
    };

    loadAndValidateUrl();
  }, [shortCode]);

  const updateClickStats = async (urlId: string) => {
    try {
      // Mettre à jour les statistiques dans Supabase
      const { error } = await supabase
        .from('shortened_urls')
        .update({
          clicks: supabase.raw('clicks + 1'),
          last_clicked_at: new Date().toISOString()
        })
        .eq('id', urlId);

      if (error) {
        console.error('Erreur lors de la mise à jour des stats:', error);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des statistiques:', error);
    }
  };

  const handleHumanVerified = async () => {
    setHumanVerified(true);
    setShowBotDetection(false);
    
    if (!url) return;
    
    // Update statistics in database
    await recordClick(url.id);
    await updateClickStats(url.id);
    
    // Direct redirect for direct links
    if (url.directLink) {
      setTimeout(() => {
        window.location.href = url.originalUrl;
      }, 200);
      return;
    }
    
    // Start countdown for regular links (réduit)
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = url.originalUrl;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url || !url.password) return;
    
    try {
      const isValid = await verifyPassword(enteredPassword, url.password);
      
      if (isValid) {
        setPasswordRequired(false);
        setPasswordError('');
        
        // Vérifier les bots même après validation du mot de passe
        const botDetection = detectBot();
        if (botDetection.isBot && botDetection.confidence > 85) {
          if (botDetection.redirectUrl) {
            window.location.replace(botDetection.redirectUrl);
            return;
          }
        }
        
        // Update statistics in database
        await recordClick(url.id);
        await updateClickStats(url.id);
        
        // Check if it's a direct link after password verification
        if (url.directLink) {
          setTimeout(() => {
            window.location.href = url.originalUrl;
          }, 200);
        } else {
          setShowBotDetection(false);
          setHumanVerified(true);
        }
      } else {
        setPasswordError('Mot de passe incorrect');
      }
    } catch (error) {
      setPasswordError('Erreur de vérification');
    }
  };

  const handleDirectRedirect = async () => {
    if (url) {
      // Update statistics before redirect
      await recordClick(url.id);
      await updateClickStats(url.id);
      window.location.href = url.originalUrl;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Vérification du lien...</p>
        </div>
      </div>
    );
  }

  if (!url) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 to-pink-100 p-4">
        <Card className="max-w-md w-full shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-6 w-6" />
              Lien introuvable ou expiré
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Le lien court <code className="bg-gray-100 px-2 py-1 rounded">{shortCode}</code> n'existe pas, a expiré ou n'est plus accessible.
            </p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="w-full"
              variant="outline"
            >
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Générer les meta tags pour le preview
  const shortUrl = `${window.location.origin}/${shortCode}`;

  if (passwordRequired) {
    return (
      <>
        <MetaTagsGenerator url={url} shortUrl={shortUrl} />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 to-orange-100 p-4">
          <Card className="max-w-md w-full shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <Shield className="h-6 w-6" />
                Lien protégé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <p className="text-gray-600">
                  Ce lien est protégé par un mot de passe. Veuillez l'entrer pour continuer.
                </p>
                <div>
                  <Input
                    type="password"
                    placeholder="Mot de passe"
                    value={enteredPassword}
                    onChange={(e) => setEnteredPassword(e.target.value)}
                    className="w-full"
                  />
                  {passwordError && (
                    <p className="text-red-600 text-sm mt-1">{passwordError}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Button type="submit" className="w-full">
                    Accéder au lien
                  </Button>
                  <Button 
                    onClick={() => window.location.href = '/'}
                    variant="outline"
                    className="w-full"
                  >
                    Annuler
                  </Button>
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
        <BotDetection
          originalUrl={url.originalUrl}
          shortCode={shortCode!}
          onHumanVerified={handleHumanVerified}
        />
      </>
    );
  }

  return (
    <>
      <MetaTagsGenerator url={url} shortUrl={shortUrl} />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-emerald-100 p-4">
        <Card className="max-w-md w-full shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <ExternalLink className="h-6 w-6" />
              Redirection sécurisée
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="text-6xl font-bold text-green-600">
                {countdown}
              </div>
              <p className="text-gray-600">
                Vous allez être redirigé vers :
              </p>
              
              <div className="p-3 bg-gray-100 rounded-lg flex items-center gap-2">
                <p className="text-sm font-mono break-all text-gray-800 flex-1">
                  {url?.originalUrl}
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="ml-2"
                  onClick={() => {
                    if (url?.originalUrl) {
                      navigator.clipboard.writeText(url.originalUrl);
                    }
                  }}
                >
                  Copier
                </Button>
              </div>
              
              <div className="space-y-2">
                <Button 
                  onClick={handleDirectRedirect}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Y aller maintenant
                </Button>
                
                <Button 
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="w-full"
                >
                  Annuler
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default Redirect;