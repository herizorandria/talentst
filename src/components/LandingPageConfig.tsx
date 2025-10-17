import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Palette, Layout, Settings } from 'lucide-react';

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
    show_countdown: true,
    show_url_preview: false,
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
        enabled: data.enabled,
        background_type: data.background_type,
        background_color: data.background_color || '#f59e0b',
        background_gradient_start: data.background_gradient_start || '#f59e0b',
        background_gradient_end: data.background_gradient_end || '#d97706',
        background_image_url: data.background_image_url || '',
        layout_type: data.layout_type,
        logo_url: data.logo_url || '',
        title: data.title,
        subtitle: data.subtitle || '',
        description: data.description || '',
        redirect_mode: data.redirect_mode,
        redirect_delay: data.redirect_delay,
        button_text: data.button_text || 'Continuer',
        button_color: data.button_color || '#f59e0b',
        show_countdown: data.show_countdown,
        show_url_preview: data.show_url_preview,
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

      if (existing) {
        const { error } = await supabase
          .from('landing_pages')
          .update(config)
          .eq('short_url_id', shortUrlId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('landing_pages')
          .insert({ ...config, short_url_id: shortUrlId });

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
              {/* Design Configuration */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Design
                </h3>

                <div className="space-y-2">
                  <Label>Type de fond</Label>
                  <select
                    value={config.background_type}
                    onChange={(e) => setConfig({ ...config, background_type: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="gradient">Dégradé</option>
                    <option value="solid">Couleur unie</option>
                    <option value="image">Image</option>
                  </select>
                </div>

                {config.background_type === 'gradient' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Couleur début</Label>
                      <Input
                        type="color"
                        value={config.background_gradient_start}
                        onChange={(e) => setConfig({ ...config, background_gradient_start: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Couleur fin</Label>
                      <Input
                        type="color"
                        value={config.background_gradient_end}
                        onChange={(e) => setConfig({ ...config, background_gradient_end: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {config.background_type === 'solid' && (
                  <div>
                    <Label>Couleur de fond</Label>
                    <Input
                      type="color"
                      value={config.background_color}
                      onChange={(e) => setConfig({ ...config, background_color: e.target.value })}
                    />
                  </div>
                )}

                {config.background_type === 'image' && (
                  <div>
                    <Label>URL de l'image</Label>
                    <Input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={config.background_image_url}
                      onChange={(e) => setConfig({ ...config, background_image_url: e.target.value })}
                    />
                  </div>
                )}
              </div>

              {/* Layout Configuration */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Layout className="h-4 w-4" />
                  Disposition
                </h3>

                <div className="space-y-2">
                  <Label>Type de disposition</Label>
                  <select
                    value={config.layout_type}
                    onChange={(e) => setConfig({ ...config, layout_type: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="center">Centré</option>
                    <option value="split">Divisé</option>
                    <option value="card">Carte</option>
                  </select>
                </div>

                <div>
                  <Label>Logo URL (optionnel)</Label>
                  <Input
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={config.logo_url}
                    onChange={(e) => setConfig({ ...config, logo_url: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Titre</Label>
                  <Input
                    type="text"
                    value={config.title}
                    onChange={(e) => setConfig({ ...config, title: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Sous-titre (optionnel)</Label>
                  <Input
                    type="text"
                    value={config.subtitle}
                    onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Description (optionnel)</Label>
                  <Textarea
                    value={config.description}
                    onChange={(e) => setConfig({ ...config, description: e.target.value })}
                  />
                </div>
              </div>

              {/* Functionality Configuration */}
              <div className="space-y-4">
                <h3 className="font-semibold">Fonctionnalité</h3>

                <div className="space-y-2">
                  <Label>Mode de redirection</Label>
                  <select
                    value={config.redirect_mode}
                    onChange={(e) => setConfig({ ...config, redirect_mode: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="auto">Automatique</option>
                    <option value="button">Bouton</option>
                  </select>
                </div>

                {config.redirect_mode === 'auto' && (
                  <div>
                    <Label>Délai de redirection (secondes)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="30"
                      value={config.redirect_delay}
                      onChange={(e) => setConfig({ ...config, redirect_delay: parseInt(e.target.value) })}
                    />
                  </div>
                )}

                {config.redirect_mode === 'button' && (
                  <>
                    <div>
                      <Label>Texte du bouton</Label>
                      <Input
                        type="text"
                        value={config.button_text}
                        onChange={(e) => setConfig({ ...config, button_text: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Couleur du bouton</Label>
                      <Input
                        type="color"
                        value={config.button_color}
                        onChange={(e) => setConfig({ ...config, button_color: e.target.value })}
                      />
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between">
                  <Label htmlFor="show_countdown">Afficher le compte à rebours</Label>
                  <Switch
                    id="show_countdown"
                    checked={config.show_countdown}
                    onCheckedChange={(checked) => setConfig({ ...config, show_countdown: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show_url_preview">Afficher l'aperçu de l'URL</Label>
                  <Switch
                    id="show_url_preview"
                    checked={config.show_url_preview}
                    onCheckedChange={(checked) => setConfig({ ...config, show_url_preview: checked })}
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleSave} disabled={loading} className="w-full">
                  {loading ? 'Sauvegarde...' : 'Sauvegarder la configuration'}
                </Button>
              </div>

              <div className="text-sm text-gray-600 bg-amber-50 p-4 rounded">
                <p className="font-medium mb-1">Aperçu de l'URL:</p>
                <p className="text-primary">
                  {window.location.origin}/{shortCode}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LandingPageConfig;
