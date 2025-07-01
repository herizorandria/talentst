
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, Copy, ExternalLink, Eye } from 'lucide-react';
import { ShortenedUrl } from '@/types/url';
import { useToast } from '@/hooks/use-toast';

interface UrlHistoryProps {
  urls: ShortenedUrl[];
  onUrlClick: (url: ShortenedUrl) => void;
}

const UrlHistory = ({ urls, onUrlClick }: UrlHistoryProps) => {
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

  const handleRedirect = (url: ShortenedUrl) => {
    onUrlClick(url);
    window.open(url.originalUrl, '_blank');
  };

  if (urls.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-gray-50 to-slate-50">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <History className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Aucun lien raccourci pour le moment</p>
            <p className="text-sm text-gray-400 mt-2">
              Créez votre premier lien raccourci ci-dessus
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <History className="h-5 w-5 text-blue-600" />
          Historique des liens
          <Badge variant="secondary" className="ml-auto">
            {urls.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {urls.map((url) => {
            const shortUrl = `${window.location.origin}/${url.shortCode}`;
            return (
              <div
                key={url.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-white to-blue-50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-sm font-mono bg-blue-100 px-2 py-1 rounded text-blue-800">
                        {url.shortCode}
                      </code>
                      {url.customCode && (
                        <Badge variant="outline" className="text-xs">
                          Personnalisé
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        <Eye className="h-3 w-3 mr-1" />
                        {url.clicks}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 truncate mb-1">
                      {url.originalUrl}
                    </p>
                    
                    <p className="text-xs text-gray-400">
                      Créé le {url.createdAt.toLocaleDateString('fr-FR')} à {url.createdAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      {url.lastClickedAt && (
                        <span className="ml-2">
                          • Dernier clic : {url.lastClickedAt.toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      onClick={() => copyToClipboard(shortUrl)}
                      variant="outline"
                      size="sm"
                      className="border-blue-200 hover:bg-blue-50"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleRedirect(url)}
                      variant="outline"
                      size="sm"
                      className="border-green-200 hover:bg-green-50"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default UrlHistory;
