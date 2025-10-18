import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Palette, Layout, Settings, User, Clock, Copy, Check, Image, Link, Wind } from 'lucide-react';

interface LandingPageConfigProps {
  shortUrlId: string;
  shortCode: string;
}

const LandingPageConfig = ({ shortUrlId, shortCode }: LandingPageConfigProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bucketFiles, setBucketFiles] = useState<any[]>([]);
  const [config, setConfig] = useState({
    enabled: false,
    background_type: 'gradient',
    background_color: '#f59e0b',
    background_gradient_start: '#f59e0b',
    background_gradient_end: '#d97706',
    background_image_url: '',
    layout_type: 'center',
    title: 'Redirection en cours...',
    subtitle: '',
    description: '',
    button_text: 'Continuer',
    button_color: '#f59e0b',
    button_url: '',
    button_icon: '',
    show_countdown: true,
    profile_photo_source: 'url',
    profile_photo_url: '',
    profile_photo_bucket_path: '',
    user_name: '',
    user_bio: '',
    show_location: false,
    show_verified_badge: false,
    countdown_to: '',
  });

  useEffect(() => {
    fetchConfig();
    fetchBucketFiles();
  }, [shortUrlId]);

  const fetchConfig = async () => {
    const { data, error } = await supabase.from('landing_pages').select('*').eq('short_url_id', shortUrlId).maybeSingle();
    if (error) {
      console.error('Error fetching config:', error);
      return;
    }
    if (data) setConfig(prev => ({ ...prev, ...data }));
  };

  const fetchBucketFiles = async () => {
    const { data, error } = await supabase.storage.from('profil').list();
    if (error) console.error('Error fetching bucket files:', error);
    else setBucketFiles(data || []);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: existing } = await supabase.from('landing_pages').select('id').eq('short_url_id', shortUrlId).maybeSingle();
      const updateData = { ...config, countdown_to: config.countdown_to || null };
      
      const { error } = existing
        ? await supabase.from('landing_pages').update(updateData).eq('short_url_id', shortUrlId)
        : await supabase.from('landing_pages').insert({ ...updateData, short_url_id: shortUrlId });

      if (error) throw error;
      toast({ title: 'Succès', description: 'Configuration sauvegardée' });
    } catch (error) {
      console.error('Error saving config:', error);
      toast({ title: 'Erreur', description: 'Impossible de sauvegarder', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    const url = `${window.location.origin}/${shortCode}`;
    navigator.clipboard.writeText(url).then(() => {
        toast({ title: 'Copié !', description: 'Le lien a été copié.' });
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-600 bg-gray-100 p-4 rounded">
                <p className="font-medium mb-1">URL de votre landing page:</p>
                <div className="flex items-center gap-2">
                    <a href={`${window.location.origin}/${shortCode}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{window.location.origin}/{shortCode}</a>
                    <Button size="sm" variant="ghost" onClick={copyToClipboard}>{copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}</Button>
                </div>
              </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" />Configuration Landing Page</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="enabled">Activer la landing page</Label>
            <Switch id="enabled" checked={config.enabled} onCheckedChange={(c) => setConfig({ ...config, enabled: c })} />
          </div>

          {config.enabled && (
            <>
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold flex items-center gap-2"><User className="h-4 w-4" />Profil</h3>
                <div className="space-y-2">
                    <Label>Source de la photo</Label>
                    <div className="flex gap-2 rounded-md p-1">
                        <Button variant={config.profile_photo_source === 'url' ? 'default' : 'ghost'} size="sm" onClick={() => setConfig({...config, profile_photo_source: 'url'})} className="flex-1"><Link className="h-4 w-4 mr-2"/>URL</Button>
                        <Button variant={config.profile_photo_source === 'bucket' ? 'default' : 'ghost'} size="sm" onClick={() => setConfig({...config, profile_photo_source: 'bucket'})} className="flex-1"><Image className="h-4 w-4 mr-2"/>Fichier</Button>
                    </div>
                </div>
                {config.profile_photo_source === 'url' ? (
                    <div><Label>Photo (URL)</Label><Input type="url" placeholder="https://..." value={config.profile_photo_url || ''} onChange={(e) => setConfig({ ...config, profile_photo_url: e.target.value })} /></div>
                ) : (
                    <div>
                        <Label>Fichier du bucket "profil"</Label>
                        <select value={config.profile_photo_bucket_path || ''} onChange={(e) => setConfig({ ...config, profile_photo_bucket_path: e.target.value })} className="w-full border rounded px-3 py-2">
                            <option value="">Sélectionner un fichier</option>
                            {bucketFiles.map(file => <option key={file.id} value={file.name}>{file.name}</option>)}
                        </select>
                    </div>
                )}
                <div><Label>Nom d'utilisateur</Label><Input type="text" value={config.user_name || ''} onChange={(e) => setConfig({ ...config, user_name: e.target.value })} /></div>
                <div><Label>Bio courte</Label><Textarea value={config.user_bio || ''} onChange={(e) => setConfig({ ...config, user_bio: e.target.value })} /></div>
                <div className="flex items-center justify-between"><Label htmlFor="verified">Badge "Vérifié"</Label><Switch id="verified" checked={config.show_verified_badge} onCheckedChange={(c) => setConfig({ ...config, show_verified_badge: c })} /></div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold flex items-center gap-2"><Palette className="h-4 w-4" />Design</h3>
                {/* ... Design fields ... */}
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold flex items-center gap-2"><Layout className="h-4 w-4" />Contenu</h3>
                <div><Label>Titre</Label><Input type="text" value={config.title} onChange={(e) => setConfig({ ...config, title: e.target.value })} /></div>
                <div><Label>Sous-titre</Label><Input type="text" value={config.subtitle || ''} onChange={(e) => setConfig({ ...config, subtitle: e.target.value })} /></div>
                <div><Label>Description</Label><Textarea value={config.description || ''} onChange={(e) => setConfig({ ...config, description: e.target.value })} /></div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold flex items-center gap-2"><Clock className="h-4 w-4" />Fonctionnalités</h3>
                <div><Label>Texte du bouton</Label><Input type="text" value={config.button_text} onChange={(e) => setConfig({ ...config, button_text: e.target.value })} /></div>
                <div><Label>URL du bouton</Label><Input type="url" placeholder="https://..." value={config.button_url || ''} onChange={(e) => setConfig({ ...config, button_url: e.target.value })} /></div>
                <div>
                    <Label>Icône du bouton (Lucide)</Label>
                    <div className="flex items-center gap-2">
                        <Input type="text" placeholder="ex: Rocket" value={config.button_icon || ''} onChange={(e) => setConfig({ ...config, button_icon: e.target.value })} />
                        <a href="https://lucide.dev/icons/" target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline"><Wind className="h-4 w-4"/></a>
                    </div>
                </div>
                <div><Label>Couleur du bouton</Label><Input type="color" value={config.button_color} onChange={(e) => setConfig({ ...config, button_color: e.target.value })} /></div>
                <div className="flex items-center justify-between"><Label htmlFor="loc">Localisation visiteur</Label><Switch id="loc" checked={config.show_location} onCheckedChange={(c) => setConfig({ ...config, show_location: c })} /></div>
                <div><Label>Compte à rebours (laisser vide pour désactiver)</Label><Input type="datetime-local" value={config.countdown_to ? config.countdown_to.substring(0, 16) : ''} onChange={(e) => setConfig({ ...config, countdown_to: e.target.value })} /></div>
              </div>

              <div className="pt-6"><Button onClick={handleSave} disabled={loading} className="w-full">{loading ? 'Sauvegarde...' : 'Sauvegarder'}</Button></div>

              
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LandingPageConfig;