import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, TestTube, Copy, Eye, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestLinkSpaceProps {
  shortUrl: string;
  originalUrl: string;
  shortCode: string;
  directLink?: boolean;
}

const TestLinkSpace = ({ shortUrl, originalUrl, shortCode, directLink }: TestLinkSpaceProps) => {
  const [testUrl, setTestUrl] = useState(shortUrl);
  const { toast } = useToast();

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

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const openInNewWindow = (url: string) => {
    const width = 800;
    const height = 600;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    window.open(
      url, 
      'test-window',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );
  };

  const testInIncognito = () => {
    toast({
      title: "Mode incognito",
      description: "Copiez le lien et ouvrez-le dans une fenêtre de navigation privée pour tester",
    });
    copyToClipboard(shortUrl);
  };

  return (
    <Card className="bg-blue-50 border-blue-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-600">
          <TestTube className="h-5 w-5" />
          Espace de test du lien
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Informations du lien */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Code: {shortCode}
            </Badge>
            {directLink && (
              <Badge className="text-xs bg-blue-100 text-blue-700">
                Lien direct
              </Badge>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 bg-white rounded border">
              <Globe className="h-4 w-4 text-gray-500" />
              <Input
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                className="border-0 bg-transparent text-sm font-mono"
                readOnly
              />
              <Button
                onClick={() => copyToClipboard(testUrl)}
                variant="ghost"
                size="sm"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-xs text-gray-600">
              <strong>Destination:</strong> {originalUrl}
            </div>
          </div>
        </div>

        {/* Options de test */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Options de test :</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Button
              onClick={() => openInNewTab(shortUrl)}
              variant="outline"
              size="sm"
              className="justify-start"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Nouvel onglet
            </Button>
            
            <Button
              onClick={() => openInNewWindow(shortUrl)}
              variant="outline"
              size="sm"
              className="justify-start"
            >
              <Eye className="h-4 w-4 mr-2" />
              Nouvelle fenêtre
            </Button>
            
            <Button
              onClick={testInIncognito}
              variant="outline"
              size="sm"
              className="justify-start"
            >
              <Globe className="h-4 w-4 mr-2" />
              Mode incognito
            </Button>
            
            <Button
              onClick={() => copyToClipboard(shortUrl)}
              variant="outline"
              size="sm"
              className="justify-start"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copier le lien
            </Button>
          </div>
        </div>

        {/* Simulateur de partage */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Test de partage :</h4>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => {
                const text = `Découvrez ce lien : ${shortUrl}`;
                if (navigator.share) {
                  navigator.share({ title: 'Lien partagé', text, url: shortUrl });
                } else {
                  copyToClipboard(text);
                }
              }}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Partage natif
            </Button>
            
            <Button
              onClick={() => {
                const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Découvrez ce lien : ${shortUrl}`)}`;
                openInNewTab(whatsappUrl);
              }}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              WhatsApp
            </Button>
            
            <Button
              onClick={() => {
                const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Découvrez ce lien : ${shortUrl}`)}`;
                openInNewTab(twitterUrl);
              }}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Twitter
            </Button>
            
            <Button
              onClick={() => {
                const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shortUrl)}`;
                openInNewTab(facebookUrl);
              }}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              Facebook
            </Button>
          </div>
        </div>

        {/* Conseils de test */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h5 className="text-sm font-medium text-blue-800 mb-2">💡 Conseils de test :</h5>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Testez dans différents navigateurs</li>
            <li>• Vérifiez le comportement sur mobile</li>
            <li>• Testez le partage sur les réseaux sociaux</li>
            <li>• Vérifiez les redirections en mode incognito</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestLinkSpace;