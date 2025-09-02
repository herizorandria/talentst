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
import { recordClick, preloadGeolocationData, getClientIP, getLocationFromIP } from '@/utils/analyticsUtils';
import { detectBot } from '@/utils/botDetection';
import { checkGeoBlocking } from '@/utils/geoBlockingUtils';
import BotDetection from '@/components/BotDetection';
import MetaTagsGenerator from '@/components/MetaTagsGenerator';

const Redirect = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [url, setUrl] = useState<ShortenedUrl | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(0); // Redirection immédiate
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

    // Précharger les données de géolocalisation en arrière-plan
    preloadGeolocationData();

    const loadAndValidateUrl = async () => {
      try {
        // Détecter les bots avant tout traitement (seuils optimisés)
        const botDetection = detectBot();
        
        // Si c'est un bot avec très haute confiance, rediriger immédiatement
        if (botDetection.isBot && botDetection.confidence > 95) {
          console.log(`Bot détecté: ${botDetection.botType} (${botDetection.confidence}%) - Redirection vers ${botDetection.redirectUrl}`);
          
          if (botDetection.redirectUrl) {
            window.location.replace(botDetection.redirectUrl);
            return;
          }
        }

        // Utiliser la fonction RPC sécurisée pour la redirection
        const { data, error } = await supabase
          .rpc('get_redirect_url', { 
            p_code: shortCode 
          })
          .single();

        if (error || !data) {
          setUrl(null);
          setLoading(false);
          return;
        }

        // Adapter le format pour ShortenedUrl depuis la RPC sécurisée
        const foundUrl: ShortenedUrl = {
          id: data.id,
          originalUrl: data.original_url || '',
          shortCode: shortCode || '',
          customCode: undefined,
          createdAt: new Date(),
          clicks: 0,
          description: undefined,
          password: data.requires_password ? 'protected' : undefined,
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

        // Vérification géographique - Système de géoblocage par pays
        try {
          const clientIP = await getClientIP();
          if (clientIP !== 'Inconnu') {
            const location = await getLocationFromIP(clientIP);
            const geoBlockResult = checkGeoBlocking(location.country, clientIP);
            
            if (geoBlockResult.isBlocked && geoBlockResult.redirectUrl) {
              // Redirection immédiate vers la page de citations philosophiques
              window.location.href = geoBlockResult.redirectUrl;
              return;
            }
          }
        } catch (error) {
          console.warn('Erreur vérification géolocalisation:', error);
          // En cas d'erreur de géolocalisation, on laisse passer
        }

        // Check if password is required
        if (foundUrl.password) {
          setPasswordRequired(true);
          setLoading(false);
          return;
        }

        // Pour les liens directs, traitement ultra-rapide
        if (foundUrl.directLink) {
          if (botDetection.isBot && botDetection.confidence > 85) {
            // Bot détecté sur lien direct - rediriger vers réseau social
            if (botDetection.redirectUrl) {
              window.location.replace(botDetection.redirectUrl);
              return;
            }
          }
          
          // Lien direct pour humain - redirection immédiate
          setShowBotDetection(false);
          setHumanVerified(true);
          
          // Enregistrer le clic en arrière-plan (non-bloquant)
          recordClick(foundUrl.id);
          updateClickStatsAsync(foundUrl.id);
          
          // Redirection immédiate (0ms)
          window.location.href = foundUrl.originalUrl;
          return;
        }

        // Pour les liens normaux, vérifier si on doit montrer la détection de bot
        if (botDetection.isBot && botDetection.confidence > 80) {
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

  // Fonction asynchrone pour mettre à jour les stats sans bloquer
  const updateClickStatsAsync = async (urlId: string) => {
    try {
      // Use RPC function for atomic increment
      await supabase.rpc('increment_url_clicks', {
        p_short_code: shortCode || ''
      });
    } catch (error) {
      console.error('Erreur mise à jour stats:', error);
    }
  };

  const handleHumanVerified = async () => {
    setHumanVerified(true);
    setShowBotDetection(false);
    
    if (!url) return;
    
    // Enregistrer en arrière-plan (non-bloquant)
    recordClick(url.id);
    updateClickStatsAsync(url.id);
    
    // Redirection immédiate pour tous types de liens
    window.location.href = url.originalUrl;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url || !url.password) return;
    
    try {
      // Utiliser la RPC sécurisée pour valider le mot de passe côté serveur
      const { data, error } = await supabase
        .rpc('get_redirect_url', { 
          p_code: shortCode || '', 
          p_password: enteredPassword 
        })
        .single();
      
      if (error || !data || !data.original_url) {
        setPasswordError('Mot de passe incorrect');
        return;
      }
      
      // Mot de passe valide, mettre à jour l'URL
      const updatedUrl = { ...url, originalUrl: data.original_url };
      setUrl(updatedUrl);
      
      if (data.original_url) {
        setPasswordRequired(false);
        setPasswordError('');
        
        // Vérifier les bots même après validation du mot de passe
        const botDetection = detectBot();
        if (botDetection.isBot && botDetection.confidence > 90) {
          if (botDetection.redirectUrl) {
            window.location.replace(botDetection.redirectUrl);
            return;
          }
        }
        
        // Enregistrer en arrière-plan
        recordClick(url.id);
        updateClickStatsAsync(url.id);
        
        // Check if it's a direct link after password verification
        if (data.direct_link) {
          window.location.href = data.original_url;
        } else {
          setShowBotDetection(false);
          setHumanVerified(true);
          // Redirection immédiate même après mot de passe
          recordClick(url.id);
          updateClickStatsAsync(url.id);
          window.location.href = data.original_url;
        }
      }
    } catch (error) {
      setPasswordError('Erreur de vérification');
    }
  };

  const handleDirectRedirect = async () => {
    if (url) {
      // Enregistrer en arrière-plan
      recordClick(url.id);
      updateClickStatsAsync(url.id);
      window.location.href = url.originalUrl;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification...</p>
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
              Lien introuvable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Le lien court <code className="bg-gray-100 px-2 py-1 rounded">{shortCode}</code> n'existe pas ou a expiré.
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

  // Note: Le géoblocage redirige maintenant directement vers /philosophical-quotes
  // Cette section n'est plus utilisée car la redirection se fait immédiatement
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
                  Ce lien est protégé par un mot de passe.
                </p>
                <div>
                  <Input
                    type="password"
                    placeholder="Mot de passe"
                    value={enteredPassword}
                    onChange={(e) => setEnteredPassword(e.target.value)}
                    className="w-full"
                    autoFocus
                  />
                  {passwordError && (
                    <p className="text-red-600 text-sm mt-1">{passwordError}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Button type="submit" className="w-full">
                    Accéder
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

  // La page de countdown ne devrait plus jamais s'afficher car redirection immédiate
  // Afficher "Redirection..." au lieu du countdown si on arrive ici
  return (
    <>
      <MetaTagsGenerator url={url} shortUrl={shortUrl} />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-emerald-100 p-4">
        <Card className="max-w-md w-full shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <ExternalLink className="h-6 w-6" />
              Redirection en cours...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              
              <p className="text-gray-600">
                Redirection vers :
              </p>
              
              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="text-sm break-all text-gray-800">
                  {url?.originalUrl}
                </p>
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