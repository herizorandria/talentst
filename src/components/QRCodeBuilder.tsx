import React, { useRef, useEffect, useState, useCallback } from 'react';
import QRCodeStyling, { DotType, CornerSquareType, CornerDotType } from 'qr-code-styling';
import { Card, CardContent } from '@/components/ui/card';
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
  ArrowLeft,
  ArrowRight,
  Link,
  MapPin,
  Mail,
  Phone,
  MessageCircle,
  Wifi,
  CreditCard,
  Bitcoin,
  X,
  Upload,
  Check,
  Crown,
  Image as ImageIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useParams } from 'react-router-dom';

// Types de points QR
const DOT_STYLES: { type: DotType; label: string; icon: string }[] = [
  { type: 'square', label: 'Carré', icon: '▪' },
  { type: 'dots', label: 'Points', icon: '●' },
  { type: 'rounded', label: 'Arrondi', icon: '◼' },
  { type: 'extra-rounded', label: 'Extra', icon: '⬤' },
  { type: 'classy', label: 'Classique', icon: '◆' },
  { type: 'classy-rounded', label: 'Élégant', icon: '◇' },
];

// Styles de bordure des marqueurs
const CORNER_SQUARE_STYLES: { type: CornerSquareType; label: string; icon: string }[] = [
  { type: 'square', label: 'Carré', icon: '▢' },
  { type: 'dot', label: 'Rond', icon: '◯' },
  { type: 'extra-rounded', label: 'Arrondi', icon: '◻' },
];

// Styles du centre des marqueurs
const CORNER_DOT_STYLES: { type: CornerDotType; label: string; icon: string }[] = [
  { type: 'square', label: 'Carré', icon: '■' },
  { type: 'dot', label: 'Rond', icon: '●' },
];

// Couleurs prédéfinies
const PRESET_COLORS = [
  '#000000', '#1a1a2e', '#16213e', '#0f3460',
  '#e94560', '#f59e0b', '#10b981', '#3b82f6',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
];

// Styles de cadres
const FRAME_STYLES = [
  { id: 'none', label: 'Aucun', icon: '❌' },
  { id: 'simple', label: 'Simple', icon: '⬜' },
  { id: 'rounded', label: 'Arrondi', icon: '🔲' },
  { id: 'badge', label: 'Badge', icon: '🏷️' },
  { id: 'circle', label: 'Cercle', icon: '⭕' },
  { id: 'ticket', label: 'Ticket', icon: '🎫' },
  { id: 'bubble', label: 'Bulle', icon: '💬' },
];

// Polices disponibles
const FONT_OPTIONS = [
  { id: 'sans', label: 'Sans-serif', family: 'Arial, sans-serif' },
  { id: 'serif', label: 'Serif', family: 'Georgia, serif' },
  { id: 'mono', label: 'Monospace', family: 'Courier New, monospace' },
  { id: 'impact', label: 'Impact', family: 'Impact, sans-serif' },
  { id: 'roboto', label: 'Roboto', family: "'Roboto', sans-serif" },
  { id: 'poppins', label: 'Poppins', family: "'Poppins', sans-serif" },
];

// Icônes de logo prédéfinies
const LOGO_PRESETS = [
  { id: 'none', icon: X, label: 'Aucun' },
  { id: 'link', icon: Link, label: 'Lien' },
  { id: 'location', icon: MapPin, label: 'Localisation' },
  { id: 'email', icon: Mail, label: 'Email' },
  { id: 'phone', icon: Phone, label: 'Téléphone' },
  { id: 'whatsapp', icon: MessageCircle, label: 'WhatsApp' },
  { id: 'wifi', icon: Wifi, label: 'WiFi' },
  { id: 'payment', icon: CreditCard, label: 'Paiement' },
  { id: 'bitcoin', icon: Bitcoin, label: 'Bitcoin' },
];

interface QRCodeBuilderProps {
  shortUrl?: string;
  originalUrl?: string;
  shortCode?: string;
  embedded?: boolean;
}

const QRCodeBuilder = ({ shortUrl, originalUrl, shortCode, embedded = false }: QRCodeBuilderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<QRCodeStyling | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // États du QR Code
  const [qrData, setQrData] = useState(shortUrl || 'https://example.com');
  const [useDirectLink, setUseDirectLink] = useState(false);
  
  // Options de design
  const [dotType, setDotType] = useState<DotType>('square');
  const [dotColor, setDotColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [transparentBg, setTransparentBg] = useState(false);
  const [useGradient, setUseGradient] = useState(false);
  const [gradientColor1, setGradientColor1] = useState('#000000');
  const [gradientColor2, setGradientColor2] = useState('#3b82f6');
  
  // Marqueurs
  const [cornerSquareType, setCornerSquareType] = useState<CornerSquareType>('square');
  const [cornerSquareColor, setCornerSquareColor] = useState('#000000');
  const [cornerDotType, setCornerDotType] = useState<CornerDotType>('square');
  const [cornerDotColor, setCornerDotColor] = useState('#000000');
  
  // Cadre
  const [frameStyle, setFrameStyle] = useState('none');
  const [frameText, setFrameText] = useState('SCAN ME');
  const [frameColor, setFrameColor] = useState('#000000');
  const [frameTextColor, setFrameTextColor] = useState('#ffffff');
  const [frameFont, setFrameFont] = useState(FONT_OPTIONS[0]);
  
  // Logo
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [logoPreset, setLogoPreset] = useState('none');
  const [removeLogoBg, setRemoveLogoBg] = useState(true);
  
  // Taille
  const [size, setSize] = useState(280);
  const [margin, setMargin] = useState(10);
  const [frameWidth, setFrameWidth] = useState(20); // Default width for frames
  const [framePadding, setFramePadding] = useState(20); // Internal padding
  const [frameTextPosition, setFrameTextPosition] = useState<'top' | 'bottom'>('bottom');

  // URL finale du QR
  const qrUrl = useDirectLink && originalUrl ? originalUrl : (shortUrl || qrData);

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
        ...(useGradient && {
          gradient: {
            type: 'linear',
            colorStops: [
              { offset: 0, color: gradientColor1 },
              { offset: 1, color: gradientColor2 }
            ]
          }
        })
      },
      backgroundOptions: {
        color: transparentBg ? 'transparent' : backgroundColor,
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
        hideBackgroundDots: removeLogoBg,
      },
      ...(logoImage && { image: logoImage })
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
          color: useGradient ? undefined : dotColor,
          type: dotType,
          ...(useGradient && {
            gradient: {
              type: 'linear',
              colorStops: [
                { offset: 0, color: gradientColor1 },
                { offset: 1, color: gradientColor2 }
              ]
            }
          })
        },
        backgroundOptions: {
          color: transparentBg ? 'transparent' : backgroundColor,
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
          hideBackgroundDots: removeLogoBg,
        },
        ...(logoImage && { image: logoImage })
      });
    }
  }, [qrUrl, dotColor, backgroundColor, dotType, cornerSquareType, cornerDotType, 
      cornerSquareColor, cornerDotColor, size, margin, transparentBg, useGradient,
      gradientColor1, gradientColor2, logoImage, removeLogoBg]);

  const downloadQRCode = async (format: 'png' | 'svg') => {
    if (qrCodeRef.current) {
      try {
        await qrCodeRef.current.download({
          name: `qrcode-${shortCode || 'custom'}`,
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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoImage(event.target?.result as string);
        setLogoPreset('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  const applyColorToAll = useCallback((color: string) => {
    setDotColor(color);
    setCornerSquareColor(color);
    setCornerDotColor(color);
  }, []);

  const getFrameStyles = () => {
    const baseStyle = {
      borderColor: frameStyle !== 'none' ? frameColor : 'transparent',
      backgroundColor: transparentBg ? 'transparent' : backgroundColor,
      borderWidth: frameStyle !== 'none' ? `${frameWidth}px` : '0px',
      borderStyle: frameStyle === 'ticket' ? 'dashed' : 'solid',
      padding: `${framePadding}px`
    };

    switch (frameStyle) {
      case 'simple': return { ...baseStyle };
      case 'rounded': return { ...baseStyle, borderRadius: '24px' };
      case 'badge': return { ...baseStyle, borderRadius: '16px' };
      case 'circle': return { ...baseStyle, borderRadius: '50%' };
      case 'ticket': return { ...baseStyle, borderRadius: '12px' };
      case 'bubble': return { ...baseStyle, borderRadius: '0px 24px 24px 24px' };
      default: return baseStyle;
    }
  };

  const getFontClass = (fontId: string) => {
    switch (fontId) {
      case 'sans': return 'font-sans';
      case 'serif': return 'font-serif';
      case 'mono': return 'font-mono';
      case 'impact': return 'font-extrabold tracking-tight';
      case 'roboto': return 'font-[Roboto]';
      case 'poppins': return 'font-[Poppins]';
      default: return 'font-sans';
    }
  };

  // Contenu principal
  const renderContent = () => (
    <div className={`flex flex-col lg:flex-row ${embedded ? '' : 'min-h-screen'}`}>
      {/* Colonne gauche - Options de personnalisation */}
      <div className={`${embedded ? 'flex-1' : 'w-full lg:w-2/3'} `}>
        <ScrollArea className={embedded ? 'h-[600px]' : 'h-auto lg:h-[calc(100vh-80px)]'}>
          <div className="p-6 space-y-6">
            
            {/* Section Content - Only when NOT embedded */}
            {!embedded && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-amber-600">
                      🔗 Content
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm text-gray-600 mb-2 block">Website URL</Label>
                      <Input
                        value={qrData}
                        onChange={(e) => setQrData(e.target.value)}
                        placeholder="https://example.com"
                        className="bg-white border-gray-200 focus:border-amber-500 transition-colors"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Section Frames */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-emerald-600">
                    🖼️ Frames
                  </h3>
                  <button className="text-gray-400 hover:text-gray-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Sélecteur de cadres */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
                  {FRAME_STYLES.map((frame) => (
                    <button
                      key={frame.id}
                      onClick={() => setFrameStyle(frame.id)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 flex items-center justify-center text-2xl transition-all ${
                        frameStyle === frame.id 
                          ? 'border-amber-500 bg-amber-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {frame.icon}
                    </button>
                  ))}
                </div>
                
                {frameStyle !== 'none' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Frame Phrase</Label>
                        <Input
                          value={frameText}
                          onChange={(e) => setFrameText(e.target.value)}
                          placeholder="SCAN ME"
                          className=" focus:border-amber-500 transition-colors"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Phrase Font</Label>
                        <select
                          value={frameFont.id}
                          onChange={(e) => setFrameFont(FONT_OPTIONS.find(f => f.id === e.target.value) || FONT_OPTIONS[0])}
                          className="w-full h-10 px-3 rounded-md border border-gray-200  focus:border-amber-500 focus:ring-0 outline-none transition-colors text-sm"
                        >
                          {FONT_OPTIONS.map((font) => (
                            <option key={font.id} value={font.id}>{font.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Frame Width ({frameWidth}px)</Label>
                        <Slider
                          value={[frameWidth]}
                          onValueChange={(v) => setFrameWidth(v[0])}
                          min={0}
                          max={50}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Frame Padding ({framePadding}px)</Label>
                        <Slider
                          value={[framePadding]}
                          onValueChange={(v) => setFramePadding(v[0])}
                          min={0}
                          max={100}
                          step={5}
                          className="w-full"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Text Position</Label>
                      <div className="flex bg-gray-100 p-1 rounded-md">
                        <button
                          onClick={() => setFrameTextPosition('top')}
                          className={`flex-1 py-1 text-xs font-bold rounded transition-all ${
                            frameTextPosition === 'top' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          TOP
                        </button>
                        <button
                          onClick={() => setFrameTextPosition('bottom')}
                          className={`flex-1 py-1 text-xs font-bold rounded transition-all ${
                            frameTextPosition === 'bottom' ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          BOTTOM
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Frame Color</Label>
                      <div className="flex items-center gap-2 p-1 border border-gray-200 rounded-md bg-white">
                        <div 
                          className="w-8 h-8 rounded border border-gray-200 shadow-sm"
                          style={{ backgroundColor: frameColor }} 
                        />
                        <Input
                          type="text"
                          value={frameColor}
                          onChange={(e) => setFrameColor(e.target.value)}
                          className="flex-1 border-0 h-8 focus-visible:ring-0 font-mono uppercase text-sm"
                        />
                        <input
                          type="color"
                          value={frameColor}
                          onChange={(e) => setFrameColor(e.target.value)}
                          className="w-8 h-8 opacity-0 absolute cursor-pointer"
                        />
                        <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded text-gray-400">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Section Color & Shape */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-amber-600">
                    🎨 Color & Shape
                  </h3>
                  <button className="text-gray-400 hover:text-gray-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Dots */}
                <div className="mb-6">
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">Dots Style</Label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
                    {DOT_STYLES.map((style) => (
                      <button
                        key={style.type}
                        onClick={() => setDotType(style.type)}
                        className={`h-12 rounded-lg border-2 flex items-center justify-center text-xl transition-all hover:bg-gray-50 ${
                          dotType === style.type 
                            ? 'border-amber-500 bg-amber-50 text-amber-600' 
                            : 'border-gray-100 text-gray-600'
                        }`}
                      >
                        {style.icon}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Couleurs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Background Color</Label>
                    <div className="flex items-center gap-2 p-1 border border-gray-200 rounded-md bg-white">
                      <div 
                        className="w-8 h-8 rounded border border-gray-200 shadow-sm relative overflow-hidden"
                      >
                        {transparentBg ? (
                          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                             <div className="bg-gray-200"></div><div className="bg-white"></div>
                             <div className="bg-white"></div><div className="bg-gray-200"></div>
                          </div>
                        ) : (
                          <div className="w-full h-full" style={{ backgroundColor }} />
                        )}
                      </div>
                      <Input
                        type="text"
                        value={transparentBg ? 'TRANSPARENT' : backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="flex-1 border-0 h-8 focus-visible:ring-0 font-mono uppercase text-sm"
                        disabled={transparentBg}
                      />
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-8 h-8 opacity-0 absolute cursor-pointer"
                        disabled={transparentBg}
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Switch
                        checked={transparentBg}
                        onCheckedChange={setTransparentBg}
                        id="transparent-bg"
                        className="scale-75 origin-left"
                      />
                      <Label htmlFor="transparent-bg" className="text-xs text-gray-500 cursor-pointer">Transparent background</Label>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Dots Color</Label>
                    <div className="flex items-center gap-2 p-1 border border-gray-200 rounded-md bg-white">
                      <div 
                        className="w-8 h-8 rounded border border-gray-200 shadow-sm"
                        style={{ backgroundColor: dotColor }} 
                      />
                      <Input
                        type="text"
                        value={dotColor}
                        onChange={(e) => applyColorToAll(e.target.value)}
                        className="flex-1 border-0 h-8 focus-visible:ring-0 font-mono uppercase text-sm"
                        disabled={useGradient}
                      />
                      <input
                        type="color"
                        value={dotColor}
                        onChange={(e) => applyColorToAll(e.target.value)}
                        className="w-8 h-8 opacity-0 absolute cursor-pointer"
                        disabled={useGradient}
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Switch
                        checked={useGradient}
                        onCheckedChange={setUseGradient}
                        id="gradient"
                        className="scale-75 origin-left"
                      />
                      <Label htmlFor="gradient" className="text-xs text-gray-500 cursor-pointer">Use Gradient</Label>
                    </div>
                  </div>
                </div>
                
                {/* Gradient Colors */}
                {useGradient && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4  rounded-lg">
                    <div>
                      <Label className="text-sm text-gray-600 mb-2 block">Gradient Start</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          value={gradientColor1}
                          onChange={(e) => setGradientColor1(e.target.value)}
                          className="flex-1 bg-white font-mono uppercase"
                        />
                        <input
                          type="color"
                          value={gradientColor1}
                          onChange={(e) => setGradientColor1(e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer border-0"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-600 mb-2 block">Gradient End</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          value={gradientColor2}
                          onChange={(e) => setGradientColor2(e.target.value)}
                          className="flex-1 bg-white font-mono uppercase"
                        />
                        <input
                          type="color"
                          value={gradientColor2}
                          onChange={(e) => setGradientColor2(e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer border-0"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Marker Border */}
                <div className="mb-6">
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">Marker Border Style</Label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                    {CORNER_SQUARE_STYLES.map((style) => (
                      <button
                        key={style.type}
                        onClick={() => setCornerSquareType(style.type)}
                        className={`h-12 rounded-lg border-2 flex items-center justify-center text-xl transition-all hover:bg-gray-50 ${
                          cornerSquareType === style.type 
                            ? 'border-amber-500 bg-amber-50 text-amber-600' 
                            : 'border-gray-100 text-gray-600'
                        }`}
                      >
                        {style.icon}
                      </button>
                    ))}
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Border Color</Label>
                    <div className="flex items-center gap-2 p-1 border border-gray-200 rounded-md bg-white">
                      <div 
                        className="w-8 h-8 rounded border border-gray-200 shadow-sm"
                        style={{ backgroundColor: cornerSquareColor }} 
                      />
                      <Input
                        type="text"
                        value={cornerSquareColor}
                        onChange={(e) => setCornerSquareColor(e.target.value)}
                        className="flex-1 border-0 h-8 focus-visible:ring-0 font-mono uppercase text-sm"
                      />
                      <input
                        type="color"
                        value={cornerSquareColor}
                        onChange={(e) => setCornerSquareColor(e.target.value)}
                        className="w-8 h-8 opacity-0 absolute cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Marker Center */}
                <div>
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">Marker Center Style</Label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
                    {CORNER_DOT_STYLES.map((style) => (
                      <button
                        key={style.type}
                        onClick={() => setCornerDotType(style.type)}
                        className={`h-12 rounded-lg border-2 flex items-center justify-center text-xl transition-all hover:bg-gray-50 ${
                          cornerDotType === style.type 
                            ? 'border-amber-500 bg-amber-50 text-amber-600' 
                            : 'border-gray-100 text-gray-600'
                        }`}
                      >
                        {style.icon}
                      </button>
                    ))}
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Center Color</Label>
                    <div className="flex items-center gap-2 p-1 border border-gray-200 rounded-md bg-white">
                      <div 
                        className="w-8 h-8 rounded border border-gray-200 shadow-sm"
                        style={{ backgroundColor: cornerDotColor }} 
                      />
                      <Input
                        type="text"
                        value={cornerDotColor}
                        onChange={(e) => setCornerDotColor(e.target.value)}
                        className="flex-1 border-0 h-8 focus-visible:ring-0 font-mono uppercase text-sm"
                      />
                      <input
                        type="color"
                        value={cornerDotColor}
                        onChange={(e) => setCornerDotColor(e.target.value)}
                        className="w-8 h-8 opacity-0 absolute cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section Logo */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-amber-600">
                    <ImageIcon className="h-5 w-5" /> Logo
                  </h3>
                  <button className="text-gray-400 hover:text-gray-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Upload Logo */}
                <div className="mb-4">
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Upload custom Logo</Label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-3 group-hover:bg-amber-100 group-hover:scale-110 transition-all">
                      <Upload className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">Click to upload image</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, SVG (Max 2MB)</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
                
                {/* Logo Presets */}
                <div className="mb-4">
                  <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Or choose a preset</Label>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {LOGO_PRESETS.map((preset) => {
                      const Icon = preset.icon;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => {
                            setLogoPreset(preset.id);
                            if (preset.id === 'none') {
                              setLogoImage(null);
                            }
                          }}
                          className={`h-10 w-10 rounded-lg border flex items-center justify-center transition-all ${
                            logoPreset === preset.id 
                              ? 'border-amber-500 bg-amber-50 text-amber-600' 
                              : 'border-gray-200 hover:border-amber-200 text-gray-500 hover:text-amber-500'
                          }`}
                          title={preset.label}
                        >
                          <Icon className="h-5 w-5" />
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Remove background option */}
                <div className="flex items-center gap-2">
                  <Switch
                    checked={removeLogoBg}
                    onCheckedChange={setRemoveLogoBg}
                    id="remove-logo-bg"
                    className="scale-75 origin-left"
                  />
                  <Label htmlFor="remove-logo-bg" className="text-xs text-gray-500 cursor-pointer">
                    Remove background behind Logo
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Section Taille */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-amber-600 mb-4">
                  📐 Size & Formatting
                </h3>
                <div className="space-y-6">
                  <div>
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Resolution ({size}px)</Label>
                    <Slider
                      value={[size]}
                      onValueChange={(v) => setSize(v[0])}
                      min={150}
                      max={1000}
                      step={10}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Quiet Zone (Margin) ({margin}px)</Label>
                    <Slider
                      value={[margin]}
                      onValueChange={(v) => setMargin(v[0])}
                      min={0}
                      max={50}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </div>

      {/* Colonne droite - Preview */}
      <div className={`${embedded ? 'w-full lg:w-[380px]' : 'w-full lg:w-1/3'} bg-gray-100 border-l lg:h-auto`}>
        <div className="sticky top-0 p-6">
          {/* Tabs Preview */}
          <div className="flex gap-2 mb-4">
            <button className="flex-1 py-2 px-4 rounded-lg bg-white text-gray-600 font-medium text-sm">
              Preview Page
            </button>
            <button className="flex-1 py-2 px-4 rounded-lg bg-amber-500 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-md">
              <QrCode className="h-4 w-4" /> QR Code
            </button>
          </div>
          
          {/* Saved Designs Button */}
          <Button variant="outline" className="w-full mb-4 bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 uppercase tracking-widest text-xs font-bold">
            <Check className="h-4 w-4 mr-2" /> Saved Designs
          </Button>
          
          {/* QR Preview Card */}
          <Card className="shadow-lg">
            <CardContent className="p-6 flex flex-col items-center">
              {/* QR Code avec cadre */}
              <div 
                className="relative p-4 transition-all duration-300"
                style={getFrameStyles()}
              >
                <div ref={qrRef} className="flex items-center justify-center" />

                {/* Texte du cadre */}
                {frameStyle !== 'none' && frameText && (
                  <div className={`absolute left-1/2 -translate-x-1/2 bg-white px-4 py-1 rounded-full border border-gray-200 shadow-sm whitespace-nowrap z-10 font-bold text-sm ${
                    getFontClass(frameFont.id)
                  } ${
                    frameTextPosition === 'top' ? '-top-3' : '-bottom-3'
                  }`} style={{ color: frameTextColor, backgroundColor: frameColor }}>
                    {frameText}
                  </div>
                )}
              </div>

              {/* Boutons de téléchargement */}
              <div className="flex gap-2 mt-8 w-full">
                <Button
                  onClick={() => downloadQRCode('png')}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-bold"
                >
                  <Download className="h-4 w-4 mr-2" /> PNG
                </Button>
                <Button
                  onClick={() => downloadQRCode('svg')}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" /> SVG
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  // Si embedded, retourner juste le contenu
  if (embedded) {
    return renderContent();
  }

  // Sinon, retourner avec le header complet
  return (
    <div className="min-h-screen ">
      {/* Header */}
      <header className="bg-black text-amber-500 shadow-xl border-b border-amber-500/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center text-black">
                <QrCode className="h-5 w-5" />
              </div>
              <span className="font-bold text-xl tracking-tight">QR<span className="text-amber-500">.io</span></span>
            </div>
            
            {/* Steps */}
            <div className="hidden md:flex items-center gap-8">
              <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500 flex items-center justify-center text-sm font-bold">
                  <Check className="h-3 w-3" />
                </div>
                <span className="text-sm font-medium text-gray-400">Choose Type</span>
              </div>
              <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500 flex items-center justify-center text-sm font-bold">
                  <Check className="h-3 w-3" />
                </div>
                <span className="text-sm font-medium text-gray-400">Content</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-black flex items-center justify-center text-sm font-bold shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                  3
                </div>
                <span className="text-sm font-bold text-white">QR Design</span>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                className="text-gray-400 hover:text-white hover:bg-white/5"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              <Button className="bg-amber-500 text-black hover:bg-amber-400 font-bold border-0">
                Continue <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button variant="outline" className="border-amber-500/50 text-amber-500 hover:bg-amber-500 hover:text-black">
                <Crown className="h-4 w-4 mr-2" /> Upgrade Now
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {renderContent()}
    </div>
  );
};

export default QRCodeBuilder;
