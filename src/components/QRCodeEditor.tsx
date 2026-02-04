import React, { useRef, useEffect, useState, useCallback } from 'react';
import QRCodeStyling, { DotType, CornerSquareType, CornerDotType } from 'qr-code-styling';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { 
  QrCode, 
  Download, 
  Palette, 
  Square, 
  Circle,
  Zap,
  Link,
  ExternalLink,
  Frame,
  Grid3X3,
  SquareAsterisk
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRCodeEditorProps {
  shortUrl: string;
  originalUrl: string;
  shortCode: string;
  directLink?: boolean;
}

const DOT_STYLES: { type: DotType; label: string; preview: string }[] = [
  { type: 'square', label: 'Carré', preview: '▪️' },
  { type: 'dots', label: 'Points', preview: '●' },
  { type: 'rounded', label: 'Arrondi', preview: '◼' },
  { type: 'extra-rounded', label: 'Extra arrondi', preview: '⬤' },
  { type: 'classy', label: 'Classique', preview: '◆' },
  { type: 'classy-rounded', label: 'Élégant', preview: '◇' },
];

const CORNER_SQUARE_STYLES: { type: CornerSquareType; label: string; preview: string }[] = [
  { type: 'square', label: 'Carré', preview: '▢' },
  { type: 'dot', label: 'Rond', preview: '◯' },
  { type: 'extra-rounded', label: 'Arrondi', preview: '◻' },
];

const CORNER_DOT_STYLES: { type: CornerDotType; label: string; preview: string }[] = [
  { type: 'square', label: 'Carré', preview: '■' },
  { type: 'dot', label: 'Rond', preview: '●' },
];

const PRESET_COLORS = [
  '#000000', '#1a1a2e', '#16213e', '#0f3460',
  '#e94560', '#f59e0b', '#10b981', '#3b82f6',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
];

const BG_COLORS = [
  '#ffffff', '#f3f4f6', '#fef3c7', '#ecfdf5',
  '#eff6ff', '#fdf2f8', '#f5f3ff', '#fafafa',
];

const FRAME_STYLES = [
  { id: 'none', label: 'Aucun', preview: '❌' },
  { id: 'simple', label: 'Simple', preview: '⬜' },
  { id: 'rounded', label: 'Arrondi', preview: '🔲' },
  { id: 'badge', label: 'Badge', preview: '🏷️' },
  { id: 'circle', label: 'Cercle', preview: '⭕' },
  { id: 'ticket', label: 'Ticket', preview: '🎫' },
  { id: 'bubble', label: 'Bulle', preview: '💬' },
];

const FONT_STYLES = [
  { id: 'sans-serif', label: 'Sans Serif', family: 'Arial, sans-serif' },
  { id: 'serif', label: 'Serif', family: 'Georgia, serif' },
  { id: 'monospace', label: 'Mono', family: 'Courier New, monospace' },
  { id: 'impact', label: 'Impact', family: 'Impact, sans-serif' },
  { id: 'cursive', label: 'Cursive', family: 'Brush Script MT, cursive' },
  { id: 'roboto', label: 'Roboto', family: "'Roboto', sans-serif" },
  { id: 'poppins', label: 'Poppins', family: "'Poppins', sans-serif" },
  { id: 'montserrat', label: 'Montserrat', family: "'Montserrat', sans-serif" },
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
  const [margin, setMargin] = useState(10);

  // Options de cadre
  const [frameStyle, setFrameStyle] = useState('none');
  const [frameText, setFrameText] = useState('SCAN ME');
  const [frameColor, setFrameColor] = useState('#000000');
  const [frameTextColor, setFrameTextColor] = useState('#ffffff');
  const [frameFont, setFrameFont] = useState(FONT_STYLES[0]);

  // URL utilisée pour le QR code
  const qrUrl = useDirectLink ? originalUrl : shortUrl;

  // Initialiser le QR code
  useEffect(() => {
    const currentRef = qrRef.current;
    
    qrCodeRef.current = new QRCodeStyling({
      width: size,
      height: size,
      data: qrUrl,
      margin: margin,
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

    if (currentRef) {
      currentRef.innerHTML = '';
      qrCodeRef.current.append(currentRef);
    }

    return () => {
      if (currentRef) {
        currentRef.innerHTML = '';
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mettre à jour le QR code
  useEffect(() => {
    if (qrCodeRef.current) {
      qrCodeRef.current.update({
        data: qrUrl,
        width: size,
        height: size,
        margin: margin,
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
  }, [qrUrl, dotColor, backgroundColor, dotType, cornerSquareType, cornerDotType, cornerSquareColor, cornerDotColor, size, margin]);

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

  const applyColorToAll = useCallback((color: string) => {
    setDotColor(color);
    setCornerSquareColor(color);
    setCornerDotColor(color);
  }, []);

  const getFrameClasses = () => {
    switch (frameStyle) {
      case 'simple':
        return 'border-4';
      case 'rounded':
        return 'border-4 rounded-2xl';
      case 'badge':
        return 'border-4 rounded-xl';
      case 'circle':
        return 'border-4 rounded-full';
      case 'ticket':
        return 'border-4 rounded-lg border-dashed';
      case 'bubble':
        return 'border-4 rounded-3xl';
      default:
        return '';
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
                    ? "Le QR code pointe directement vers le site" 
                    : "Le QR code utilise le lien court"
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

          <div className="mt-3 p-2 rounded bg-background border border-border">
            <div className="flex items-center gap-2 text-xs">
              {useDirectLink ? (
                <ExternalLink className="h-3 w-3 text-amber-500 shrink-0" />
              ) : (
                <Link className="h-3 w-3 text-primary shrink-0" />
              )}
              <span className="font-mono truncate">{qrUrl}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Prévisualisation QR Code */}
          <div className="flex flex-col items-center justify-center p-6 rounded-lg border border-border bg-muted/30 min-h-[380px]">
            {/* Container avec cadre */}
            <div 
              className={`relative p-4 ${getFrameClasses()}`}
              style={{ 
                borderColor: frameStyle !== 'none' ? frameColor : 'transparent',
                backgroundColor: backgroundColor 
              }}
            >
              <div ref={qrRef} className="flex items-center justify-center" />
              
              {/* Texte du cadre */}
              {frameStyle !== 'none' && frameText && (
                <div 
                  className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-sm font-bold whitespace-nowrap"
                  style={{ 
                    backgroundColor: frameColor,
                    color: frameTextColor,
                    fontFamily: frameFont.family
                  }}
                >
                  {frameText}
                </div>
              )}
            </div>
            
            <div className="flex gap-2 mt-6">
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
          <ScrollArea className="h-[420px] pr-4">
            <Tabs defaultValue="dots" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="dots" className="text-xs">
                  <Grid3X3 className="h-3 w-3 mr-1" />
                  Points
                </TabsTrigger>
                <TabsTrigger value="corners" className="text-xs">
                  <SquareAsterisk className="h-3 w-3 mr-1" />
                  Coins
                </TabsTrigger>
                <TabsTrigger value="colors" className="text-xs">
                  <Palette className="h-3 w-3 mr-1" />
                  Couleurs
                </TabsTrigger>
                <TabsTrigger value="frame" className="text-xs">
                  <Frame className="h-3 w-3 mr-1" />
                  Cadre
                </TabsTrigger>
              </TabsList>

              {/* Onglet Points */}
              <TabsContent value="dots" className="space-y-4 mt-2">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Style des points</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {DOT_STYLES.map((style) => (
                      <Button
                        key={style.type}
                        variant={dotType === style.type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setDotType(style.type)}
                        className="flex flex-col h-auto py-2 px-2"
                      >
                        <span className="text-lg">{style.preview}</span>
                        <span className="text-[10px] mt-1">{style.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Taille ({size}px)</Label>
                  <Slider
                    value={[size]}
                    onValueChange={(v) => setSize(v[0])}
                    min={150}
                    max={400}
                    step={10}
                    className="w-full"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Marge ({margin}px)</Label>
                  <Slider
                    value={[margin]}
                    onValueChange={(v) => setMargin(v[0])}
                    min={0}
                    max={50}
                    step={5}
                    className="w-full"
                  />
                </div>
              </TabsContent>

              {/* Onglet Coins */}
              <TabsContent value="corners" className="space-y-4 mt-2">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Bordure des marqueurs</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {CORNER_SQUARE_STYLES.map((style) => (
                      <Button
                        key={style.type}
                        variant={cornerSquareType === style.type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCornerSquareType(style.type)}
                        className="flex flex-col h-auto py-2"
                      >
                        <span className="text-lg">{style.preview}</span>
                        <span className="text-[10px] mt-1">{style.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Couleur bordure marqueurs</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={cornerSquareColor}
                      onChange={(e) => setCornerSquareColor(e.target.value)}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={cornerSquareColor}
                      onChange={(e) => setCornerSquareColor(e.target.value)}
                      className="flex-1 font-mono uppercase text-sm"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Centre des marqueurs</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {CORNER_DOT_STYLES.map((style) => (
                      <Button
                        key={style.type}
                        variant={cornerDotType === style.type ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCornerDotType(style.type)}
                        className="flex flex-col h-auto py-2"
                      >
                        <span className="text-lg">{style.preview}</span>
                        <span className="text-[10px] mt-1">{style.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Couleur centre marqueurs</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={cornerDotColor}
                      onChange={(e) => setCornerDotColor(e.target.value)}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={cornerDotColor}
                      onChange={(e) => setCornerDotColor(e.target.value)}
                      className="flex-1 font-mono uppercase text-sm"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Onglet Couleurs */}
              <TabsContent value="colors" className="space-y-4 mt-2">
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    Couleur des points
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => applyColorToAll(color)}
                        className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${
                          dotColor === color ? 'ring-2 ring-primary ring-offset-2' : 'border-muted-foreground/30'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={dotColor}
                      onChange={(e) => applyColorToAll(e.target.value)}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={dotColor}
                      onChange={(e) => applyColorToAll(e.target.value)}
                      className="flex-1 font-mono uppercase text-sm"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Couleur de fond</Label>
                  <div className="flex flex-wrap gap-2">
                    {BG_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setBackgroundColor(color)}
                        className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${
                          backgroundColor === color ? 'ring-2 ring-primary ring-offset-2' : 'border-muted-foreground/30'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
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
                      className="flex-1 font-mono uppercase text-sm"
                      placeholder="#FFFFFF"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Onglet Cadre */}
              <TabsContent value="frame" className="space-y-4 mt-2">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Style du cadre</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {FRAME_STYLES.map((frame) => (
                      <Button
                        key={frame.id}
                        variant={frameStyle === frame.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFrameStyle(frame.id)}
                        className="flex flex-col h-auto py-2 px-2"
                      >
                        <span className="text-lg">{frame.preview}</span>
                        <span className="text-[10px] mt-1">{frame.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {frameStyle !== 'none' && (
                  <>
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Texte du badge</Label>
                      <Input
                        type="text"
                        value={frameText}
                        onChange={(e) => setFrameText(e.target.value)}
                        placeholder="SCAN ME"
                        maxLength={20}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Police du texte</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {FONT_STYLES.map((font) => (
                          <Button
                            key={font.id}
                            variant={frameFont.id === font.id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFrameFont(font)}
                            className="text-xs"
                            style={{ fontFamily: font.family }}
                          >
                            {font.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Couleur du cadre</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={frameColor}
                          onChange={(e) => setFrameColor(e.target.value)}
                          className="w-12 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={frameColor}
                          onChange={(e) => setFrameColor(e.target.value)}
                          className="flex-1 font-mono uppercase text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Couleur du texte</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          value={frameTextColor}
                          onChange={(e) => setFrameTextColor(e.target.value)}
                          className="w-12 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={frameTextColor}
                          onChange={(e) => setFrameTextColor(e.target.value)}
                          className="flex-1 font-mono uppercase text-sm"
                        />
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeEditor;
