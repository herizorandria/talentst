import React, { useRef, useEffect, useState } from 'react';
import QRCodeStyling, { DotType, CornerSquareType, CornerDotType } from 'qr-code-styling';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  QrCode, 
  Download, 
  Palette, 
  Square, 
  Circle,
  Zap,
  Link,
  ExternalLink
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRCodeEditorProps {
  shortUrl: string;
  originalUrl: string;
  shortCode: string;
  directLink?: boolean;
}

const DOT_STYLES: { type: DotType; label: string; icon: React.ReactNode }[] = [
  { type: 'square', label: 'Carré', icon: <Square className="h-4 w-4" /> },
  { type: 'dots', label: 'Points', icon: <Circle className="h-4 w-4" /> },
  { type: 'rounded', label: 'Arrondi', icon: <Circle className="h-4 w-4" /> },
  { type: 'extra-rounded', label: 'Extra arrondi', icon: <Circle className="h-4 w-4" /> },
  { type: 'classy', label: 'Classique', icon: <Square className="h-4 w-4" /> },
  { type: 'classy-rounded', label: 'Classique arrondi', icon: <Square className="h-4 w-4" /> },
];

const CORNER_STYLES: { type: CornerSquareType; label: string }[] = [
  { type: 'square', label: 'Carré' },
  { type: 'dot', label: 'Point' },
  { type: 'extra-rounded', label: 'Arrondi' },
];

const CORNER_DOT_STYLES: { type: CornerDotType; label: string }[] = [
  { type: 'square', label: 'Carré' },
  { type: 'dot', label: 'Point' },
];

const PRESET_COLORS = [
  '#000000', '#1a1a2e', '#16213e', '#0f3460',
  '#e94560', '#f59e0b', '#10b981', '#3b82f6',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
];

const QRCodeEditor = ({ shortUrl, originalUrl, shortCode, directLink: initialDirectLink = false }: QRCodeEditorProps) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<QRCodeStyling | null>(null);
  const { toast } = useToast();

  // État pour le mode lien direct
  const [useDirectLink, setUseDirectLink] = useState(initialDirectLink);

  // Options de personnalisation
  const [dotColor, setDotColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [dotType, setDotType] = useState<DotType>('square');
  const [cornerSquareType, setCornerSquareType] = useState<CornerSquareType>('square');
  const [cornerDotType, setCornerDotType] = useState<CornerDotType>('square');
  const [cornerSquareColor, setCornerSquareColor] = useState('#000000');
  const [cornerDotColor, setCornerDotColor] = useState('#000000');
  const [size, setSize] = useState(250);

  // URL utilisée pour le QR code
  const qrUrl = useDirectLink ? originalUrl : shortUrl;

  // Initialiser le QR code
  useEffect(() => {
    qrCodeRef.current = new QRCodeStyling({
      width: size,
      height: size,
      data: qrUrl,
      margin: 10,
      dotsOptions: {
        color: dotColor,
        type: dotType,
      },
      backgroundOptions: {
        color: backgroundColor,
      },
      cornersSquareOptions: {
        color: cornerSquareColor,
        type: cornerSquareType,
      },
      cornersDotOptions: {
        color: cornerDotColor,
        type: cornerDotType,
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 10,
      },
    });

    if (qrRef.current) {
      qrRef.current.innerHTML = '';
      qrCodeRef.current.append(qrRef.current);
    }

    return () => {
      if (qrRef.current) {
        qrRef.current.innerHTML = '';
      }
    };
  }, []);

  // Mettre à jour le QR code
  useEffect(() => {
    if (qrCodeRef.current) {
      qrCodeRef.current.update({
        data: qrUrl,
        width: size,
        height: size,
        dotsOptions: {
          color: dotColor,
          type: dotType,
        },
        backgroundOptions: {
          color: backgroundColor,
        },
        cornersSquareOptions: {
          color: cornerSquareColor,
          type: cornerSquareType,
        },
        cornersDotOptions: {
          color: cornerDotColor,
          type: cornerDotType,
        },
      });
    }
  }, [qrUrl, dotColor, backgroundColor, dotType, cornerSquareType, cornerDotType, cornerSquareColor, cornerDotColor, size]);

  const downloadQRCode = async (format: 'png' | 'svg') => {
    if (qrCodeRef.current) {
      try {
        await qrCodeRef.current.download({
          name: `qrcode-${shortCode}`,
          extension: format,
        });
        toast({
          title: 'Succès',
          description: `QR Code téléchargé en ${format.toUpperCase()}`,
        });
      } catch (error) {
        toast({
          title: 'Erreur',
          description: 'Impossible de télécharger le QR Code',
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <Card className="bg-card border-border shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-primary">
          <QrCode className="h-5 w-5" />
          Éditeur de QR Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Option lien direct */}
        <div className="p-4 rounded-lg border border-border bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-amber-500" />
              <div>
                <Label htmlFor="direct-link-qr" className="text-sm font-medium">
                  QR Code vers l'URL originale
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {useDirectLink 
                    ? "Le QR code pointe directement vers le site (sans redirection)" 
                    : "Le QR code utilise le lien court avec landing page"
                  }
                </p>
              </div>
            </div>
            <Switch
              id="direct-link-qr"
              checked={useDirectLink}
              onCheckedChange={setUseDirectLink}
            />
          </div>

          {/* Affichage de l'URL utilisée */}
          <div className="mt-3 p-2 rounded bg-background border border-border">
            <div className="flex items-center gap-2 text-xs">
              {useDirectLink ? (
                <ExternalLink className="h-3 w-3 text-amber-500" />
              ) : (
                <Link className="h-3 w-3 text-primary" />
              )}
              <span className="font-mono truncate">{qrUrl}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Prévisualisation QR Code */}
          <div className="flex flex-col items-center justify-center p-6 rounded-lg border border-border bg-white min-h-[320px]">
            <div ref={qrRef} className="flex items-center justify-center" />
            
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => downloadQRCode('png')}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                PNG
              </Button>
              <Button
                onClick={() => downloadQRCode('svg')}
                variant="outline"
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                SVG
              </Button>
            </div>
          </div>

          {/* Options de personnalisation */}
          <ScrollArea className="h-[400px] pr-4">
            <Tabs defaultValue="dots" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="dots">Points</TabsTrigger>
                <TabsTrigger value="corners">Coins</TabsTrigger>
                <TabsTrigger value="colors">Couleurs</TabsTrigger>
              </TabsList>

              <TabsContent value="dots" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Style des points</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {DOT_STYLES.map((style) => (
                      <Button
                        key={style.type}
                        variant={dotType === style.type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setDotType(style.type)}
                        className="flex flex-col h-auto py-2"
                      >
                        {style.icon}
                        <span className="text-xs mt-1">{style.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Taille</Label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="150"
                      max="400"
                      value={size}
                      onChange={(e) => setSize(Number(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm w-16">{size}px</span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="corners" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Bordure des coins</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {CORNER_STYLES.map((style) => (
                      <Button
                        key={style.type}
                        variant={cornerSquareType === style.type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCornerSquareType(style.type)}
                      >
                        {style.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Centre des coins</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {CORNER_DOT_STYLES.map((style) => (
                      <Button
                        key={style.type}
                        variant={cornerDotType === style.type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCornerDotType(style.type)}
                      >
                        {style.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="colors" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Couleur des points
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => {
                          setDotColor(color);
                          setCornerSquareColor(color);
                          setCornerDotColor(color);
                        }}
                        className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                          dotColor === color ? 'border-primary ring-2 ring-primary/50' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={dotColor}
                      onChange={(e) => {
                        setDotColor(e.target.value);
                        setCornerSquareColor(e.target.value);
                        setCornerDotColor(e.target.value);
                      }}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={dotColor}
                      onChange={(e) => {
                        setDotColor(e.target.value);
                        setCornerSquareColor(e.target.value);
                        setCornerDotColor(e.target.value);
                      }}
                      className="flex-1 font-mono uppercase"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Couleur de fond</Label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setBackgroundColor('#ffffff')}
                      className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                        backgroundColor === '#ffffff' ? 'border-primary ring-2 ring-primary/50' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: '#ffffff' }}
                    />
                    <button
                      onClick={() => setBackgroundColor('#f3f4f6')}
                      className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                        backgroundColor === '#f3f4f6' ? 'border-primary ring-2 ring-primary/50' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: '#f3f4f6' }}
                    />
                    <button
                      onClick={() => setBackgroundColor('#fef3c7')}
                      className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                        backgroundColor === '#fef3c7' ? 'border-primary ring-2 ring-primary/50' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: '#fef3c7' }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="flex-1 font-mono uppercase"
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeEditor;
