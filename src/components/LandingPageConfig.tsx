import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Palette, Layout, Settings, User, Clock } from 'lucide-react';

interface LandingPageConfigProps {
  shortUrlId: string;
  shortCode: string;
}

const LandingPageConfig = ({ shortUrlId, shortCode }: LandingPageConfigProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    enabled: false,
    background_type: 'gradient',
    background_color: '#f59e0b',
    background_gradient_start: '#f59e0b',
    background_gradient_end: '#d97706',
    background_image_url: '',
    layout_type: 'center',
    logo_url: '',
    title: 'Redirection en cours...',
    subtitle: '',
    description: '',
    redirect_mode: 'auto',
    redirect_delay: 3,
    button_text: 'Continuer',
    button_color: '#f59e0b',
    button_url: '',
    show_countdown: true,
    show_url_preview: false,
    profile_photo_url: '',
    user_name: '',
    user_bio: '',
    show_location: false,
    show_verified_badge: false,
    countdown_to: '',
  });

  useEffect(() => {
    fetchConfig();
  }, [shortUrlId]);

  const fetchConfig = async () => {
    const { data, error } = await supabase
      .from('landing_pages')
      .select('*')
      .eq('short_url_id', shortUrlId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching landing page config:', error);
      return;
    }

    if (data) {
      setConfig({
        ...config,
        ...data,
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: existing } = await supabase
        .from('landing_pages')
        .select('id')
        .eq('short_url_id', shortUrlId)
        .maybeSingle();

      const updateData = { ...config };
      if (updateData.countdown_to === '') {
        updateData.countdown_to = null;
      }

      if (existing) {
        const { error } = await supabase
          .from('landing_pages')
          .update(updateData)
          .eq('short_url_id', shortUrlId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('landing_pages')
          .insert({ ...updateData, short_url_id: shortUrlId });

        if (error) throw error;
      }

      toast({
        title: 'Succès',
        description: 'Configuration de la landing page sauvegardée',
      });
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder la configuration',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration Landing Page
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="enabled">Activer la landing page personnalisée</Label>
            <Switch
              id="enabled"
              checked={config.enabled}
              onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })}
            />
          </div>

          {config.enabled && (
            <>
              {/* Profile Section */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2"><User className="h-4 w-4" />Profil</h3>
                <div>
                  <Label>Photo de profil (URL)</Label>
                  <Input type="url" placeholder="https://..." value={config.profile_photo_url || ''} onChange={(e) => setConfig({ ...config, profile_photo_url: e.target.value })} />
                </div>
                <div>
                  <Label>Nom d'utilisateur</Label>
                  <Input type="text" value={config.user_name || ''} onChange={(e) => setConfig({ ...config, user_name: e.target.value })} />
                </div>
                <div>
                  <Label>Bio courte</Label>
                  <Textarea value={config.user_bio || ''} onChange={(e) => setConfig({ ...config, user_bio: e.target.value })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show_verified_badge">Afficher le badge "Vérifié"</Label>
                  <Switch id="show_verified_badge" checked={config.show_verified_badge} onCheckedChange={(checked) => setConfig({ ...config, show_verified_badge: checked })} />
                </div>
              </div>

              {/* Design Configuration */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2"><Palette className="h-4 w-4" />Design</h3>
                <div className="space-y-2">
                  <Label>Type de fond</Label>
                  <select value={config.background_type} onChange={(e) => setConfig({ ...config, background_type: e.target.value })} className="w-full border rounded px-3 py-2">
                    <option value="gradient">Dégradé</option>
                    <option value="solid">Couleur unie</option>
                    <option value="image">Image</option>
                  </select>
                </div>
                {config.background_type === 'gradient' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Couleur début</Label><Input type="color" value={config.background_gradient_start} onChange={(e) => setConfig({ ...config, background_gradient_start: e.target.value })} /></div>
                    <div><Label>Couleur fin</Label><Input type="color" value={config.background_gradient_end} onChange={(e) => setConfig({ ...config, background_gradient_end: e.target.value })} /></div>
                  </div>
                )}
                {config.background_type === 'solid' && (<div><Label>Couleur de fond</Label><Input type="color" value={config.background_color} onChange={(e) => setConfig({ ...config, background_color: e.target.value })} /></div>)}
                {config.background_type === 'image' && (<div><Label>URL de l'image</Label><Input type="url" placeholder="https://..." value={config.background_image_url} onChange={(e) => setConfig({ ...config, background_image_url: e.target.value })} /></div>)}
              </div>

              {/* Layout Configuration */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2"><Layout className="h-4 w-4" />Disposition</h3>
                <div><Label>Titre</Label><Input type="text" value={config.title} onChange={(e) => setConfig({ ...config, title: e.target.value })} /></div>
                <div><Label>Sous-titre (optionnel)</Label><Input type="text" value={config.subtitle || ''} onChange={(e) => setConfig({ ...config, subtitle: e.target.value })} /></div>
                <div><Label>Description (optionnel)</Label><Textarea value={config.description || ''} onChange={(e) => setConfig({ ...config, description: e.target.value })} /></div>
              </div>

              {/* Functionality Configuration */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2"><Clock className="h-4 w-4" />Fonctionnalité</h3>
                <div><Label>Texte du bouton</Label><Input type="text" value={config.button_text} onChange={(e) => setConfig({ ...config, button_text: e.target.value })} /></div>
                <div><Label>URL du bouton</Label><Input type="url" placeholder="https://..." value={config.button_url || ''} onChange={(e) => setConfig({ ...config, button_url: e.target.value })} /></div>
                <div><Label>Couleur du bouton</Label><Input type="color" value={config.button_color} onChange={(e) => setConfig({ ...config, button_color: e.target.value })} /></div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="show_countdown">Afficher le compte à rebours global</Label>
                  <Switch id="show_countdown" checked={config.show_countdown} onCheckedChange={(checked) => setConfig({ ...config, show_countdown: checked })} />
                </div>

                <div>
                  <Label>Compte à rebours jusqu'à (laisser vide pour désactiver)</Label>
                  <Input type="datetime-local" value={config.countdown_to ? config.countdown_to.substring(0, 16) : ''} onChange={(e) => setConfig({ ...config, countdown_to: e.target.value })} />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show_location">Afficher la localisation du visiteur</Label>
                  <Switch id="show_location" checked={config.show_location} onCheckedChange={(checked) => setConfig({ ...config, show_location: checked })} />
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleSave} disabled={loading} className="w-full">{loading ? 'Sauvegarde...' : 'Sauvegarder'}</Button>
              </div>

              <div className="text-sm text-gray-600 bg-gray-100 p-4 rounded">
                <p className="font-medium mb-1">URL de votre landing page:</p>
                <a href={`${window.location.origin}/${shortCode}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{window.location.origin}/{shortCode}</a>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LandingPageConfig;