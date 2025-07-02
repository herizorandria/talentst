import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ExternalLink, AlertTriangle } from 'lucide-react';

interface BotDetectionProps {
  originalUrl: string;
  shortCode: string;
  onHumanVerified: () => void;
}

const BotDetection = ({ originalUrl, shortCode, onHumanVerified }: BotDetectionProps) => {
  const [isBot, setIsBot] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const detectBot = () => {
      // Détection basique de bots
      const userAgent = navigator.userAgent.toLowerCase();
      const botPatterns = [
        'bot', 'crawler', 'spider', 'scraper', 'facebook', 'twitter', 
        'telegram', 'whatsapp', 'linkedin', 'pinterest', 'tiktok',
        'instagram', 'snapchat', 'discord', 'slack', 'skype'
      ];
      
      const isBotUA = botPatterns.some(pattern => userAgent.includes(pattern));
      
      // Vérifications supplémentaires
      const hasWebdriver = 'webdriver' in navigator;
      const hasPhantom = 'phantom' in window || '_phantom' in window;
      const hasSelenium = '_selenium' in window || 'callSelenium' in window;
      const noPlugins = navigator.plugins.length === 0;
      const noLanguages = navigator.languages.length === 0;
      
      const suspiciousScore = [
        isBotUA,
        hasWebdriver,
        hasPhantom,
        hasSelenium,
        noPlugins,
        noLanguages,
        !navigator.cookieEnabled
      ].filter(Boolean).length;
      
      return suspiciousScore >= 2;
    };

    const botDetected = detectBot();
    setIsBot(botDetected);
    
    if (botDetected) {
      setShowChallenge(true);
    } else {
      // Si ce n'est pas un bot, démarrer le countdown
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            onHumanVerified();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [onHumanVerified]);

  const handleHumanVerification = () => {
    // Vérification d'interaction humaine
    const startTime = Date.now();
    
    // Demander une interaction (clic)
    setTimeout(() => {
      const interactionTime = Date.now() - startTime;
      if (interactionTime > 100) { // Temps minimum d'interaction humaine
        onHumanVerified();
      }
    }, 100);
  };

  if (isBot && showChallenge) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 to-red-100 p-4">
        <Card className="max-w-md w-full shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <Shield className="h-6 w-6" />
              Vérification de sécurité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  Activité automatisée détectée
                </p>
              </div>
              
              <p className="text-gray-600">
                Pour des raisons de sécurité, veuillez confirmer que vous êtes un humain.
              </p>
              
              <div className="p-3 bg-gray-100 rounded-lg">
                <p className="text-sm font-mono break-all text-gray-800">
                  Destination: {originalUrl}
                </p>
              </div>
              
              <Button 
                onClick={handleHumanVerification}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Je suis humain - Continuer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Affichage normal pour les humains
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-emerald-100 p-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <ExternalLink className="h-6 w-6" />
            Redirection sécurisée
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="text-6xl font-bold text-green-600">
              {countdown}
            </div>
            
            <p className="text-gray-600">
              Redirection automatique vers :
            </p>
            
            <div className="p-3 bg-gray-100 rounded-lg">
              <p className="text-sm font-mono break-all text-gray-800">
                {originalUrl}
              </p>
            </div>
            
            <Button 
              onClick={onHumanVerified}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Y aller maintenant
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BotDetection;