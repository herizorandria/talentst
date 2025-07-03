import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, Copy, ExternalLink, Eye, Trash2, Calendar, Tag, BarChart3 } from 'lucide-react';
import { ShortenedUrl } from '@/types/url';
import { useToast } from '@/hooks/use-toast';
import { useDatabase } from '@/hooks/useDatabase';
import { useNavigate } from 'react-router-dom';

interface UrlHistoryProps {
  urls: ShortenedUrl[];
  onUrlClick: (url: ShortenedUrl) => void;
}

const UrlHistory = ({ urls, onUrlClick }: UrlHistoryProps) => {
  const { toast } = useToast();
  const { deleteUrl } = useDatabase();
  const navigate = useNavigate();

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

  const handleDelete = async (url: ShortenedUrl) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le lien ${url.shortCode} ?`)) {
      await deleteUrl(url.id);
    }
  };

  const handleViewAnalytics = (shortCode: string) => {
    navigate(`/analytics/${shortCode}`);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <div className="space-y-4">
          {urls.map((url) => {
            const shortUrl = `${window.location.origin}/${url.shortCode}`;
            return (
              <div
                key={url.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-white to-blue-50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* En-tête avec code et badges */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <code className="text-sm font-mono bg-blue-100 px-2 py-1 rounded text-blue-800">
                        {url.shortCode}
                      </code>
                      
                      {url.customCode && (
                        <Badge variant="outline" className="text-xs">
                          Personnalisé
                        </Badge>
                      )}
                      
                      {url.directLink && (
                        <Badge className="text-xs bg-green-100 text-green-700">
                          Direct
                        </Badge>
                      )}
                      
                      {url.password && (
                        <Badge className="text-xs bg-orange-100 text-orange-700">
                          Protégé
                        </Badge>
                      )}
                      
                      {url.expiresAt && (
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          Expire le {url.expiresAt.toLocaleDateString('fr-FR')}
                        </Badge>
                      )}
                      
                      <Badge variant="secondary" className="text-xs">
                        <Eye className="h-3 w-3 mr-1" />
                        {url.clicks}
                      </Badge>
                    </div>
                    
                    {/* Description si présente */}
                    {url.description && (
                      <p className="text-sm text-gray-700 mb-2 font-medium">
                        {url.description}
                      </p>
                    )}
                    
                    {/* URL originale */}
                    <p className="text-sm text-gray-600 truncate mb-2">
                      <strong>Destination:</strong> {url.originalUrl}
                    </p>
                    
                    {/* Tags si présents */}
                    {url.tags && url.tags.length > 0 && (
                      <div className="flex items-center gap-1 mb-2 flex-wrap">
                        <Tag className="h-3 w-3 text-gray-500" />
                        {url.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {/* Informations de date */}
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>
                        <strong>Créé:</strong> {formatDate(url.createdAt)}
                      </p>
                      {url.lastClickedAt && (
                        <p>
                          <strong>Dernier clic:</strong> {formatDate(url.lastClickedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      onClick={() => copyToClipboard(shortUrl)}
                      variant="outline"
                      size="sm"
                      className="border-blue-200 hover:bg-blue-50"
                      title="Copier le lien"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      onClick={() => handleRedirect(url)}
                      variant="outline"
                      size="sm"
                      className="border-green-200 hover:bg-green-50"
                      title="Ouvrir le lien"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>

                    <Button
                      onClick={() => handleViewAnalytics(url.shortCode)}
                      variant="outline"
                      size="sm"
                      className="border-purple-200 hover:bg-purple-50"
                      title="Voir les analytics"
                    >
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      onClick={() => handleDelete(url)}
                      variant="outline"
                      size="sm"
                      className="border-red-200 hover:bg-red-50 text-red-600"
                      title="Supprimer le lien"
                    >
                      <Trash2 className="h-4 w-4" />
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