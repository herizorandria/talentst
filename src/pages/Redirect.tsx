
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShortenedUrl } from '@/types/url';
import { ExternalLink, AlertCircle, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loadUrlsSecurely, saveUrlsSecurely } from '@/utils/storageUtils';
import { verifyPassword } from '@/utils/securityUtils';
import { isUrlExpired } from '@/utils/urlUtils';

const Redirect = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [url, setUrl] = useState<ShortenedUrl | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(5);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (!shortCode) {
      setLoading(false);
      return;
    }

    const loadAndValidateUrl = async () => {
      try {
        const urls = await loadUrlsSecurely();
        const foundUrl = urls.find((url: ShortenedUrl) => url.shortCode === shortCode);
        
        if (foundUrl) {
          // Check if URL has expired
          if (isUrlExpired(foundUrl.expiresAt)) {
            setUrl(null);
            setLoading(false);
            return;
          }
          
          // Check if password is required
          if (foundUrl.password) {
            setPasswordRequired(true);
            setUrl(foundUrl);
            setLoading(false);
            return;
          }
          
          setUrl(foundUrl);
          
          // Update statistics securely
          const updatedUrls = urls.map((url: ShortenedUrl) =>
            url.shortCode === shortCode
              ? { ...url, clicks: url.clicks + 1, lastClickedAt: new Date() }
              : url
          );
          await saveUrlsSecurely(updatedUrls);
          
          // Start countdown for redirect
          const timer = setInterval(() => {
            setCountdown(prev => {
              if (prev <= 1) {
                clearInterval(timer);
                window.location.href = foundUrl.originalUrl;
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
          
          return () => clearInterval(timer);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'URL:', error);
      }
      
      setLoading(false);
    };

    loadAndValidateUrl();
  }, [shortCode]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url || !url.password) return;
    
    try {
      const isValid = await verifyPassword(enteredPassword, url.password);
      
      if (isValid) {
        setPasswordRequired(false);
        setPasswordError('');
        
        // Update statistics and redirect
        const urls = await loadUrlsSecurely();
        const updatedUrls = urls.map((u: ShortenedUrl) =>
          u.shortCode === shortCode
            ? { ...u, clicks: u.clicks + 1, lastClickedAt: new Date() }
            : u
        );
        await saveUrlsSecurely(updatedUrls);
        
        // Start countdown
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
      } else {
        setPasswordError('Mot de passe incorrect');
      }
    } catch (error) {
      setPasswordError('Erreur de vérification');
    }
  };

  const handleDirectRedirect = () => {
    if (url) {
      window.location.href = url.originalUrl;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Recherche du lien...</p>
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
              Le lien court <code className="bg-gray-100 px-2 py-1 rounded">{shortCode}</code> n'existe pas, a expiré ou n'est plus accessible pour des raisons de sécurité.
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

  if (passwordRequired) {
    return (
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
    );
  }

  return (
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
            
            <div className="p-3 bg-gray-100 rounded-lg">
              <p className="text-sm font-mono break-all text-gray-800">
                {url.originalUrl}
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
  );
};

export default Redirect;
