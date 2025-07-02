import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ShortenedUrl } from '@/types/url';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { hashPassword } from '@/utils/securityUtils';

export const useDatabase = () => {
  const [urls, setUrls] = useState<ShortenedUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  // Charger les URLs depuis la base de données
  const loadUrls = async () => {
    if (!user) {
      setUrls([]);
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
        console.error('Erreur lors du chargement des URLs:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos liens",
          variant: "destructive"
        });
        return;
      }

      const formattedUrls: ShortenedUrl[] = data.map(url => ({
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

      setUrls(formattedUrls);
    } catch (error) {
      console.error('Erreur lors du chargement des URLs:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos liens",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Sauvegarder une nouvelle URL
  const saveUrl = async (url: ShortenedUrl): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour sauvegarder des liens",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Hasher le mot de passe si présent
      const passwordHash = url.password ? await hashPassword(url.password) : null;

      // Vérifier unicité du short_code et custom_code
      const { data: existing, error: checkError } = await supabase
        .from('shortened_urls')
        .select('id')
        .or(`short_code.eq.${url.shortCode},custom_code.eq.${url.shortCode}${url.customCode ? `,short_code.eq.${url.customCode},custom_code.eq.${url.customCode}` : ''}`)
        .limit(1);

      if (checkError) {
        console.error('Erreur lors de la vérification d\'unicité:', checkError);
        toast({
          title: "Erreur",
          description: "Erreur lors de la vérification d'unicité du code.",
          variant: "destructive"
        });
        return false;
      }

      if (existing && existing.length > 0) {
        toast({
          title: "Code déjà utilisé",
          description: "Le code personnalisé ou généré est déjà pris. Veuillez en choisir un autre.",
          variant: "destructive"
        });
        return false;
      }

      const { error } = await supabase
        .from('shortened_urls')
        .insert({
          user_id: user.id,
          original_url: url.originalUrl,
          short_code: url.shortCode,
          custom_code: url.customCode || null,
          description: url.description || null,
          tags: url.tags || null,
          password_hash: passwordHash,
          expires_at: url.expiresAt?.toISOString() || null,
          direct_link: url.directLink || false,
          clicks: 0
        });

      if (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        toast({
          title: "Erreur",
          description: "Impossible de sauvegarder le lien",
          variant: "destructive"
        });
        return false;
      }

      // Recharger les URLs
      await loadUrls();
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le lien",
        variant: "destructive"
      });
      return false;
    }
  };

  // Mettre à jour les statistiques d'un lien (optimisé pour les redirections)
  const updateUrlStats = async (shortCode: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('shortened_urls')
        .update({
          clicks: supabase.raw('clicks + 1'),
          last_clicked_at: new Date().toISOString()
        })
        .eq('short_code', shortCode);

      if (error) {
        console.error('Erreur lors de la mise à jour des stats:', error);
        return false;
      }

      // Mettre à jour l'état local seulement si l'utilisateur est connecté et que c'est son lien
      if (user) {
        setUrls(prev => prev.map(url => 
          url.shortCode === shortCode 
            ? { ...url, clicks: url.clicks + 1, lastClickedAt: new Date() }
            : url
        ));
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des stats:', error);
      return false;
    }
  };

  // Récupérer une URL par son code court (pour les redirections) - optimisé
  const getUrlByShortCode = async (shortCode: string): Promise<ShortenedUrl | null> => {
    try {
      const { data, error } = await supabase
        .from('shortened_urls')
        .select('*')
        .or(`short_code.eq.${shortCode},custom_code.eq.${shortCode}`)
        .limit(1)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        originalUrl: data.original_url,
        shortCode: data.short_code,
        customCode: data.custom_code || undefined,
        createdAt: new Date(data.created_at),
        clicks: data.clicks,
        lastClickedAt: data.last_clicked_at ? new Date(data.last_clicked_at) : undefined,
        description: data.description || undefined,
        tags: data.tags || undefined,
        password: data.password_hash || undefined,
        expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
        directLink: data.direct_link || false
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'URL:', error);
      return null;
    }
  };

  // Supprimer une URL
  const deleteUrl = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('shortened_urls')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erreur lors de la suppression:', error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le lien",
          variant: "destructive"
        });
        return false;
      }

      // Mettre à jour l'état local
      setUrls(prev => prev.filter(url => url.id !== id));
      
      toast({
        title: "Succès",
        description: "Lien supprimé avec succès",
      });
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le lien",
        variant: "destructive"
      });
      return false;
    }
  };

  // Charger les URLs au montage du composant et quand l'utilisateur change
  useEffect(() => {
    loadUrls();
  }, [user]);

  return {
    urls,
    loading,
    saveUrl,
    updateUrlStats,
    getUrlByShortCode,
    deleteUrl,
    refreshUrls: loadUrls
  };
};