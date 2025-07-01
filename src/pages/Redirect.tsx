
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShortenedUrl } from '@/types/url';
import { ExternalLink, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const Redirect = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [url, setUrl] = useState<ShortenedUrl | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!shortCode) {
      setLoading(false);
      return;
    }

    // Récupérer les URLs depuis le localStorage
    const savedUrls = localStorage.getItem('shortenedUrls');
    if (savedUrls) {
      try {
        const parsedUrls = JSON.parse(savedUrls).map((url: any) => ({
          ...url,
          createdAt: new Date(url.createdAt),
          lastClickedAt: url.lastClickedAt ? new Date(url.lastClickedAt) : undefined
        }));
        
        const foundUrl = parsedUrls.find((url: ShortenedUrl) => url.shortCode === shortCode);
        
        if (foundUrl) {
          setUrl(foundUrl);
          
          // Mettre à jour les statistiques
          const updatedUrls = parsedUrls.map((url: ShortenedUrl) =>
            url.shortCode === shortCode
              ? { ...url, clicks: url.clicks + 1, lastClickedAt: new Date() }
              : url
          );
          localStorage.setItem('shortenedUrls', JSON.stringify(updatedUrls));
          
          // Rediriger après le countdown
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
    }
    
    setLoading(false);
  }, [shortCode]);

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

  return (
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
