import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Copy, 
  ExternalLink, 
  Trash2, 
  Eye, 
  Calendar, 
  Tag, 
  Search,
  Filter,
  Link2,
  Globe,
  Shield,
  Zap,
  Clock,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ShortenedUrl } from '@/types/url';

const LinksManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [links, setLinks] = useState<ShortenedUrl[]>([]);
  const [filteredLinks, setFilteredLinks] = useState<ShortenedUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'protected' | 'direct' | 'expired'>('all');

  useEffect(() => {
    const fetchLinks = async () => {
      if (!user) {
        setLinks([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('shortened_urls')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          setError("Erreur lors du chargement des liens");
          setLoading(false);
          return;
        }

        const formattedLinks: ShortenedUrl[] = data.map((url: any) => ({
          id: url.id,
          originalUrl: url.original_url,
          shortCode: url.short_code,
          customCode: url.custom_code || undefined,
          createdAt: new Date(url.created_at),
          clicks: url.clicks,
          lastClickedAt: url.last_clicked_at ? new Date(url.last_clicked_at) : undefined,
          description: url.description || undefined,
          tags: url.tags || undefined,
          password: url.password_hash || undefined,
          expiresAt: url.expires_at ? new Date(url.expires_at) : undefined,
          directLink: url.direct_link || false
        }));

        setLinks(formattedLinks);
        setFilteredLinks(formattedLinks);
      } catch (err) {
        setError("Erreur lors du chargement des liens");
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, [user]);

  // Filtrage et recherche
  useEffect(() => {
    let filtered = links;

    // Filtrage par type
    if (filterType === 'protected') {
      filtered = filtered.filter(link => link.password);
    } else if (filterType === 'direct') {
      filtered = filtered.filter(link => link.directLink);
    } else if (filterType === 'expired') {
      filtered = filtered.filter(link => link.expiresAt && new Date() > link.expiresAt);
    }

    // Recherche textuelle
    if (searchTerm) {
      filtered = filtered.filter(link =>
        link.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.shortCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredLinks(filtered);
  }, [links, searchTerm, filterType]);

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

  const handleDelete = async (linkId: string) => {
    if (!user) return;

    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce lien ?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('shortened_urls')
        .delete()
        .eq('id', linkId)
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le lien",
          variant: "destructive"
        });
        return;
      }

      setLinks(prev => prev.filter(l => l.id !== linkId));
      toast({
        title: "Succès",
        description: "Lien supprimé avec succès",
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le lien",
        variant: "destructive"
      });
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

  const isExpired = (expiresAt?: Date) => {
    return expiresAt && new Date() > expiresAt;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos liens...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={() => window.location.reload()}>
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl text-blue-600">
            <Link2 className="h-6 w-6" />
            Gestion de mes liens
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{links.length}</div>
              <div className="text-sm text-gray-600">Total des liens</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">
                {links.reduce((sum, link) => sum + link.clicks, 0)}
              </div>
              <div className="text-sm text-gray-600">Total des clics</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">
                {links.filter(link => link.password).length}
              </div>
              <div className="text-sm text-gray-600">Liens protégés</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">
                {links.filter(link => isExpired(link.expiresAt)).length}
              </div>
              <div className="text-sm text-gray-600">Liens expirés</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Barre de recherche et filtres */}
      <Card className="shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher par URL, code, description ou tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterType('all')}
                size="sm"
              >
                Tous
              </Button>
              <Button
                variant={filterType === 'protected' ? 'default' : 'outline'}
                onClick={() => setFilterType('protected')}
                size="sm"
              >
                <Shield className="h-4 w-4 mr-1" />
                Protégés
              </Button>
              <Button
                variant={filterType === 'direct' ? 'default' : 'outline'}
                onClick={() => setFilterType('direct')}
                size="sm"
              >
                <Zap className="h-4 w-4 mr-1" />
                Directs
              </Button>
              <Button
                variant={filterType === 'expired' ? 'default' : 'outline'}
                onClick={() => setFilterType('expired')}
                size="sm"
              >
                <Clock className="h-4 w-4 mr-1" />
                Expirés
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des liens */}
      {filteredLinks.length === 0 ? (
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Link2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-2">
                {searchTerm || filterType !== 'all' 
                  ? 'Aucun lien ne correspond à vos critères' 
                  : 'Aucun lien trouvé'
                }
              </p>
              {searchTerm || filterType !== 'all' ? (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('all');
                  }}
                >
                  Effacer les filtres
                </Button>
              ) : (
                <p className="text-sm text-gray-400">
                  Créez votre premier lien dans l'onglet "Raccourcir"
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredLinks.map(link => {
            const shortUrl = `${window.location.origin}/${link.shortCode}`;
            const expired = isExpired(link.expiresAt);
            
            return (
              <Card 
                key={link.id} 
                className={`shadow-lg transition-all duration-200 hover:shadow-xl ${
                  expired ? 'border-red-200 bg-red-50' : 'hover:border-blue-300'
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* En-tête avec code et badges */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <code className="text-sm font-mono bg-blue-100 px-2 py-1 rounded text-blue-800">
                          /{link.customCode || link.shortCode}
                        </code>
                        
                        {link.customCode && (
                          <Badge variant="outline" className="text-xs">
                            Personnalisé
                          </Badge>
                        )}
                        
                        {link.directLink && (
                          <Badge className="text-xs bg-green-100 text-green-700">
                            <Zap className="h-3 w-3 mr-1" />
                            Direct
                          </Badge>
                        )}
                        
                        {link.password && (
                          <Badge className="text-xs bg-orange-100 text-orange-700">
                            <Shield className="h-3 w-3 mr-1" />
                            Protégé
                          </Badge>
                        )}
                        
                        {expired && (
                          <Badge variant="destructive" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Expiré
                          </Badge>
                        )}
                        
                        {link.expiresAt && !expired && (
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="h-3 w-3 mr-1" />
                            Expire le {link.expiresAt.toLocaleDateString('fr-FR')}
                          </Badge>
                        )}
                        
                        <Badge variant="secondary" className="text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          {link.clicks} clics
                        </Badge>
                      </div>
                      
                      {/* Description si présente */}
                      {link.description && (
                        <p className="text-sm text-gray-700 mb-2 font-medium">
                          {link.description}
                        </p>
                      )}
                      
                      {/* URL originale */}
                      <div className="flex items-center gap-2 mb-2">
                        <Globe className="h-4 w-4 text-gray-500 shrink-0" />
                        <a 
                          href={link.originalUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 underline truncate"
                        >
                          {link.originalUrl}
                        </a>
                      </div>
                      
                      {/* Tags si présents */}
                      {link.tags && link.tags.length > 0 && (
                        <div className="flex items-center gap-1 mb-2 flex-wrap">
                          <Tag className="h-3 w-3 text-gray-500" />
                          {link.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {/* Informations de date */}
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>
                          <strong>Créé:</strong> {formatDate(link.createdAt)}
                        </p>
                        {link.lastClickedAt && (
                          <p>
                            <strong>Dernier clic:</strong> {formatDate(link.lastClickedAt)}
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
                        title="Copier le lien court"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        onClick={() => window.open(link.originalUrl, '_blank')}
                        variant="outline"
                        size="sm"
                        className="border-green-200 hover:bg-green-50"
                        title="Ouvrir le lien original"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>

                      <Button
                        onClick={() => handleViewAnalytics(link.shortCode)}
                        variant="outline"
                        size="sm"
                        className="border-purple-200 hover:bg-purple-50"
                        title="Voir les analytics"
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        onClick={() => handleDelete(link.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-200 hover:bg-red-50 text-red-600"
                        title="Supprimer le lien"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LinksManager;