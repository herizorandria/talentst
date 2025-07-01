
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ShortenedUrl } from '@/types/url';
import AdvancedUrlForm from './AdvancedUrlForm';
import UrlInputForm from './UrlInputForm';
import UrlResult from './UrlResult';
import { generateShortCode, isValidUrl, createShortUrl } from '@/utils/urlUtils';

interface UrlShortenerProps {
  onUrlShortened: (url: ShortenedUrl) => void;
}

const UrlShortener = ({ onUrlShortened }: UrlShortenerProps) => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [password, setPassword] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState<ShortenedUrl | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateRandomCode = () => {
    setCustomCode(generateShortCode());
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
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const shortCode = customCode.trim() || generateShortCode();
    const tagArray = tags.trim() ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : undefined;
    
    const newUrl: ShortenedUrl = {
      id: Date.now().toString(),
      originalUrl,
      shortCode,
      customCode: customCode.trim() || undefined,
      createdAt: new Date(),
      clicks: 0,
      description: description.trim() || undefined,
      tags: tagArray,
      password: password.trim() || undefined,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined
    };

    setShortenedUrl(newUrl);
    onUrlShortened(newUrl);
    setIsLoading(false);

    toast({
      title: "URL raccourcie !",
      description: "Votre lien a été créé avec succès",
    });
  };

  const shortUrl = shortenedUrl ? createShortUrl(shortenedUrl.shortCode) : '';

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
            <UrlInputForm
              originalUrl={originalUrl}
              setOriginalUrl={setOriginalUrl}
              customCode={customCode}
              setCustomCode={setCustomCode}
              onGenerateRandomCode={handleGenerateRandomCode}
            />

            <AdvancedUrlForm
              description={description}
              setDescription={setDescription}
              tags={tags}
              setTags={setTags}
              password={password}
              setPassword={setPassword}
              expiresAt={expiresAt}
              setExpiresAt={setExpiresAt}
            />

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
        <UrlResult shortenedUrl={shortenedUrl} shortUrl={shortUrl} />
      )}
    </div>
  );
};

export default UrlShortener;
