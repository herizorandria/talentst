
import React, { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ShortenedUrl } from '@/types/url';
import AdvancedUrlForm from './AdvancedUrlForm';
import UrlInputForm from './UrlInputForm';
import UrlResult from './UrlResult';
import DirectLinkOption from './DirectLinkOption';

import { generateShortCode, isValidUrl, createShortUrl } from '@/utils/urlUtils';
import { sanitizeInput, checkRateLimit } from '@/utils/securityUtils';
import { useDatabase } from '@/hooks/useDatabase';

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
  const [directLink, setDirectLink] = useState(false);
  const [shortenedUrl, setShortenedUrl] = useState<ShortenedUrl | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { saveUrl } = useDatabase();
  const navigate = useNavigate();

  const handleGenerateRandomCode = async () => {
    const code = await generateShortCode();
    setCustomCode(code);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting check
    const userIdentifier = 'user-session'; // In production, use actual user ID
    if (!checkRateLimit(userIdentifier, 10, 60000)) {
      toast({
        title: "Limite atteinte",
        description: "Trop de tentatives. Veuillez attendre avant de réessayer.",
        variant: "destructive"
      });
      return;
    }

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
        description: "URL non autorisée ou dangereuse détectée",
        variant: "destructive"
      });
      return;
    }

    // Validate password strength if provided
    if (password.trim() && password.length < 6) {
      toast({
        title: "Mot de passe faible",
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    try {
      const shortCode = customCode.trim() ? sanitizeInput(customCode.trim()) : await generateShortCode();
      const sanitizedDescription = description.trim() ? sanitizeInput(description.trim()) : undefined;
      const sanitizedTags = tags.trim() ? 
        tags.split(',').map(tag => sanitizeInput(tag.trim())).filter(tag => tag) : 
        undefined;
      
      const newUrl: ShortenedUrl = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        originalUrl: sanitizeInput(originalUrl),
        shortCode,
        customCode: customCode.trim() ? sanitizeInput(customCode.trim()) : undefined,
        createdAt: new Date(),
        clicks: 0,
        description: sanitizedDescription,
        tags: sanitizedTags,
        password: password.trim() || undefined, // Will be hashed in storage
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        directLink
      };

      // Sauvegarder dans la base de données
      const saved = await saveUrl(newUrl);
      setShortenedUrl(newUrl);
      onUrlShortened(newUrl);
      setIsLoading(false);

      if (saved) {
        if (directLink) {
          // Rediriger immédiatement vers l'URL d'origine
          window.location.href = newUrl.originalUrl;
        } else {
          toast({
            title: "URL raccourcie !",
            description: "Votre lien a été créé avec succès",
          });
        }
      }
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Erreur",
        description: "Impossible de créer le lien court",
        variant: "destructive"
      });
    }
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

            <DirectLinkOption
              directLink={directLink}
              setDirectLink={setDirectLink}
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
