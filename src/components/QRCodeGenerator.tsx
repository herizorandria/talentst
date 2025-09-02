
import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRCodeGeneratorProps {
  url: string;
  shortCode: string;
}

const QRCodeGenerator = ({ url, shortCode }: QRCodeGeneratorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (canvasRef.current && url) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#7c3aed',
          light: '#ffffff'
        }
      }, (error) => {
        if (error) {
          console.error('Erreur lors de la génération du QR Code:', error);
        }
      });
    }
  }, [url]);

  const downloadQRCode = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `qr-code-${shortCode}.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
      
      toast({
    <Card className="bg-white border-amber-200">
        description: "Le QR Code a été sauvegardé avec succès",
      <CardTitle className="flex items-center gap-2 text-amber-600">
    }
  };

  return (
    <Card className="bg-white border-amber-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-600">
          <QrCode className="h-5 w-5" />
          QR Code
      className="w-full border-amber-200 hover:bg-amber-50"
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <canvas ref={canvasRef} className="mx-auto border rounded-lg" />
        <Button
          onClick={downloadQRCode}
          variant="outline"
          className="w-full border-amber-200 hover:bg-amber-50"
        >
          <Download className="h-4 w-4 mr-2" />
          Télécharger le QR Code
        </Button>
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
