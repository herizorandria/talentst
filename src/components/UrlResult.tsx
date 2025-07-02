
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Copy, Zap } from 'lucide-react';
import { ShortenedUrl } from '@/types/url';
import { useToast } from '@/hooks/use-toast';
import QRCodeGenerator from './QRCodeGenerator';

interface UrlResultProps {
  shortenedUrl: ShortenedUrl;
  shortUrl: string;
}

const UrlResult = ({ shortenedUrl, shortUrl }: UrlResultProps) => {
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-lg animate-in slide-in-from-bottom-4 duration-500">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-green-800">
                URL raccourcie avec succès !
              </h3>
              {shortenedUrl.directLink && (
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  <Zap className="h-3 w-3" />
                  Direct
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-green-200">
              <Input
                value={shortUrl}
                readOnly
                className="border-0 bg-transparent text-lg font-mono"
              />
              <Button
                onClick={() => copyToClipboard(shortUrl)}
                variant="outline"
                size="sm"
                className="shrink-0 border-green-200 hover:bg-green-100"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-sm text-green-700 space-y-1">
              <p><strong>URL originale :</strong> {shortenedUrl.originalUrl}</p>
              <p><strong>Créé le :</strong> {shortenedUrl.createdAt.toLocaleDateString('fr-FR')}</p>
              {shortenedUrl.directLink && (
                <p><strong>Redirection :</strong> Immédiate (lien direct)</p>
              )}
              {shortenedUrl.description && (
                <p><strong>Description :</strong> {shortenedUrl.description}</p>
              )}
              {shortenedUrl.tags && shortenedUrl.tags.length > 0 && (
                <p><strong>Tags :</strong> {shortenedUrl.tags.join(', ')}</p>
              )}
              {shortenedUrl.password && (
                <p><strong>Protégé par mot de passe :</strong> ✓</p>
              )}
              {shortenedUrl.expiresAt && (
                <p><strong>Expire le :</strong> {shortenedUrl.expiresAt.toLocaleDateString('fr-FR')}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <QRCodeGenerator url={shortUrl} shortCode={shortenedUrl.shortCode} />
    </div>
  );
};

export default UrlResult;
