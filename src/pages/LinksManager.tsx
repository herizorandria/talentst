import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ShortenedUrl } from '@/types/url';

const LinksManager = () => {
  const { user } = useAuth();
  const [links, setLinks] = useState<ShortenedUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLinks = async () => {
      if (!user) {
        setLinks([]);
        setLoading(false);
        return;
      }
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
      setLinks(
        data.map((url: any) => ({
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
        }))
      );
      setLoading(false);
    };
    fetchLinks();
  }, [user]);

  if (loading) return <div className="p-8 text-center">Chargement...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Gestion de mes liens</h1>
      {links.length === 0 ? (
        <div className="text-center text-gray-500">Aucun lien trouvé.</div>
      ) : (
        links.map(link => (
          <Card key={link.id} className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="font-mono text-blue-600">/{link.customCode || link.shortCode}</span>
                <span className="ml-auto text-xs text-gray-400">{link.createdAt.toLocaleString()}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2">
                <span className="font-semibold">URL cible :</span> <a href={link.originalUrl} className="text-blue-700 underline" target="_blank" rel="noopener noreferrer">{link.originalUrl}</a>
              </div>
              <div className="mb-2">
                <span className="font-semibold">Clics :</span> {link.clicks}
                {link.lastClickedAt && (
                  <span className="ml-4 text-xs text-gray-500">Dernier clic : {link.lastClickedAt.toLocaleString()}</span>
                )}
              </div>
              {link.description && <div className="mb-2"><span className="font-semibold">Description :</span> {link.description}</div>}
              {link.tags && link.tags.length > 0 && <div className="mb-2"><span className="font-semibold">Tags :</span> {link.tags.join(', ')}</div>}
              {link.expiresAt && <div className="mb-2"><span className="font-semibold">Expire le :</span> {link.expiresAt.toLocaleString()}</div>}
              <Button 
                variant="destructive" 
                className="mt-2"
                onClick={async () => {
                  if (!user) return;
                  const { error } = await supabase
                    .from('shortened_urls')
                    .delete()
                    .eq('id', link.id)
                    .eq('user_id', user.id);
                  if (!error) {
                    setLinks(prev => prev.filter(l => l.id !== link.id));
                  } else {
                    alert("Erreur lors de la suppression du lien.");
                  }
                }}
              >
                Supprimer
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default LinksManager;
