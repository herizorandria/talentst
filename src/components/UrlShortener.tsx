
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Link, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ShortenedUrl } from '@/types/url';

interface UrlShortenerProps {
  onUrlShortened: (url: ShortenedUrl) => void;
}

const UrlShortener = ({ onUrlShortened }: UrlShortenerProps) => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState<ShortenedUrl | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateShortCode = () => {
    return Math.random().toString(36).substring(2, 8);
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!originalUrl.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une URL",
        variant: "destructive"
      });
      return;
    }

    if (!isValidUrl(originalUrl)) {
      toast({
        title: "URL invalide",
        description: "Veuillez entrer une URL valide (ex: https://example.com)",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simuler un délai de traitement
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const shortCode = customCode.trim() || generateShortCode();
    const newUrl: ShortenedUrl = {
      id: Date.now().toString(),
      originalUrl,
      shortCode,
      customCode: customCode.trim() || undefined,
      createdAt: new Date(),
      clicks: 0
    };

    setShortenedUrl(newUrl);
    onUrlShortened(newUrl);
    setIsLoading(false);

    toast({
      title: "URL raccourcie !",
      description: "Votre lien a été créé avec succès",
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copié !",
        description: "Le lien a été copié dans le presse-papiers",
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien",
        variant: "destructive"
      });
    }
  };

  const shortUrl = shortenedUrl ? `${window.location.origin}/${shortenedUrl.shortCode}` : '';

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            <Link className="h-6 w-6 text-purple-600" />
            Raccourcir une URL
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="url"
                placeholder="https://example.com/tres-long-lien-a-raccourcir"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                className="h-12 text-lg border-purple-200 focus:border-purple-400"
              />
            </div>
            
            <div>
              <Input
                type="text"
                placeholder="Code personnalisé (optionnel)"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
                className="h-10 border-purple-200 focus:border-purple-400"
                maxLength={20}
              />
              <p className="text-sm text-gray-500 mt-1">
                Laissez vide pour un code automatique
              </p>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Création...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Raccourcir
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {shortenedUrl && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-lg animate-in slide-in-from-bottom-4 duration-500">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-800">
                URL raccourcie avec succès !
              </h3>
              
              <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-green-200">
                <Input
                  value={shortUrl}
                  readOnly
                  className="border-0 bg-transparent text-lg font-mono"
                />
                <Button
                  onClick={() => copyToClipboard(shortUrl)}
                  variant="outline"
                  size="sm"
                  className="shrink-0 border-green-200 hover:bg-green-100"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-sm text-green-700">
                <p><strong>URL originale :</strong> {shortenedUrl.originalUrl}</p>
                <p><strong>Créé le :</strong> {shortenedUrl.createdAt.toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UrlShortener;
