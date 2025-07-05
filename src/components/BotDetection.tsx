import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, ExternalLink, AlertTriangle, Bot, User } from 'lucide-react';
import { detectBot, handleBotRedirect, waitForHumanInteraction, createBotChallenge } from '@/utils/botDetection';

interface BotDetectionProps {
  originalUrl: string;
  shortCode: string;
  onHumanVerified: () => void;
}

const BotDetection = ({ originalUrl, shortCode, onHumanVerified }: BotDetectionProps) => {
  const [detection, setDetection] = useState<any>(null);
  const [showChallenge, setShowChallenge] = useState(false);
  const [countdown, setCountdown] = useState(1); // Ultra-rapide
  const [challengeStep, setChallengeStep] = useState(0);

  useEffect(() => {
    const runDetection = async () => {
      // Détecter si c'est un bot (sans vérifications supplémentaires pour la vitesse)
      const result = detectBot(undefined, false);
      setDetection(result);
      
      // Seuil très élevé pour éviter les faux positifs
      if (result.isBot && result.confidence > 90) {
        // Bot détecté avec très haute confiance - redirection immédiate
        console.log(`Bot ${result.botType} détecté - Redirection vers ${result.redirectUrl}`);
        
        // Redirection quasi-immédiate
        setTimeout(() => {
          if (result.redirectUrl) {
            window.location.replace(result.redirectUrl);
          }
        }, 200);
        return;
      }
      
      if (result.isBot && result.confidence > 75) {
        // Bot possible - challenge ultra-rapide
        setShowChallenge(true);
        return;
      }
      
      // Probablement humain - countdown ultra-rapide
      startCountdown();
    };
    
    runDetection();
  }, []);

  const startCountdown = () => {
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
  };

  const handleHumanChallenge = async () => {
    setChallengeStep(1);
    
    // Attendre une interaction humaine (timeout très court)
    const hasInteraction = await waitForHumanInteraction(2000);
    
    if (!hasInteraction) {
      // Pas d'interaction - probablement un bot
      if (detection?.redirectUrl) {
        window.location.replace(detection.redirectUrl);
      } else {
        window.location.replace('https://www.google.com');
      }
      return;
    }
    
    setChallengeStep(2);
    
    // Challenge mathématique ultra-rapide
    const challengeResult = await createBotChallenge();
    
    if (!challengeResult) {
      // Échec du challenge - redirection
      if (detection?.redirectUrl) {
        window.location.replace(detection.redirectUrl);
      } else {
        window.location.replace('https://www.google.com');
      }
      return;
    }
    
    // Challenge réussi - continuer
    onHumanVerified();
  };

  // Si bot détecté avec très haute confiance, afficher un message de redirection
  if (detection?.isBot && detection?.confidence > 90) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 to-orange-100 p-4">
        <Card className="max-w-md w-full shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Bot className="h-6 w-6" />
              Redirection automatique
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                Redirection en cours...
              </p>
              
              <div className="text-center">
                <div className="w-6 h-6 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si bot possible, afficher le challenge ultra-rapide
  if (showChallenge) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 to-orange-100 p-4">
        <Card className="max-w-md w-full shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <Shield className="h-6 w-6" />
              Vérification rapide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {challengeStep === 0 && (
                <>
                  <p className="text-gray-600">
                    Vérification de sécurité requise.
                  </p>
                  
                  <Button 
                    onClick={handleHumanChallenge}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    autoFocus
                  >
                    <User className="h-4 w-4 mr-2" />
                    Continuer
                  </Button>
                </>
              )}
              
              {challengeStep === 1 && (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Cliquez n'importe où...
                  </p>
                  <div className="w-6 h-6 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              )}
              
              {challengeStep === 2 && (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Vérification...
                  </p>
                  <div className="w-6 h-6 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Affichage normal pour les humains (ultra-rapide)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-emerald-100 p-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <ExternalLink className="h-6 w-6" />
            Redirection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="text-4xl font-bold text-green-600">
              {countdown}
            </div>
            
            <p className="text-gray-600">
              Redirection vers :
            </p>
            
            <div className="p-3 bg-gray-100 rounded-lg">
              <p className="text-sm break-all text-gray-800">
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