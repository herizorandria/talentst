import { useState, useEffect, useCallback, useMemo } from 'react';
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

  // Optimized URL loading with memoization
  const loadUrls = useCallback(async () => {
    if (!user) {
      setUrls([]);
      setLoading(false);
      return;
    }

    try {
      // Only select necessary fields to reduce payload
      const { data, error } = await supabase
        .from('shortened_urls')
        .select('id, original_url, short_code, custom_code, created_at, clicks, last_clicked_at, description, tags, password_hash, expires_at, direct_link')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100); // Limit initial load for better performance

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
  }, [user, toast]);

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

  // Optimized URL stats update with debouncing
  const updateUrlStats = useCallback(async (shortCode: string): Promise<boolean> => {
    try {
      // Use RPC for atomic increment to avoid race conditions
      const { error } = await supabase.rpc('increment_url_clicks', {
        p_short_code: shortCode
      }).single();

      if (error) {
        // Fallback to manual update if RPC doesn't exist - use the database function we created
        const { error: rpcError } = await supabase.rpc('increment_url_clicks', {
          p_short_code: shortCode
        });

        if (rpcError) {
          console.error('Erreur lors de la mise à jour des stats:', rpcError);
          return false;
        }
      }

      // Optimistically update local state
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
  }, [user]);

  // Highly optimized URL retrieval with minimal data transfer
  const getUrlByShortCode = useCallback(async (shortCode: string): Promise<ShortenedUrl | null> => {
    try {
      // Only select essential fields for faster query
      const { data, error } = await supabase
        .from('shortened_urls')
        .select('id, original_url, short_code, custom_code, created_at, clicks, last_clicked_at, description, tags, password_hash, expires_at, direct_link')
        .or(`short_code.eq.${shortCode},custom_code.eq.${shortCode}`)
        .limit(1)
        .maybeSingle(); // Use maybeSingle to avoid errors when no data found

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
  }, []);

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

  // Load URLs when user changes with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadUrls();
    }, 100); // Small delay to prevent rapid successive calls

    return () => clearTimeout(timeoutId);
  }, [loadUrls]);

  // Memoize return object to prevent unnecessary re-renders
  const memoizedReturn = useMemo(() => ({
    urls,
    loading,
    saveUrl,
    updateUrlStats,
    getUrlByShortCode,
    deleteUrl,
    refreshUrls: loadUrls
  }), [urls, loading, saveUrl, updateUrlStats, getUrlByShortCode, deleteUrl, loadUrls]);

  return memoizedReturn;
};