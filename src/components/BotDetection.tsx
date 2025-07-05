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
  const [countdown, setCountdown] = useState(2); // Réduit à 2 secondes
  const [challengeStep, setChallengeStep] = useState(0);

  useEffect(() => {
    const runDetection = async () => {
      // Détecter si c'est un bot
      const result = detectBot();
      setDetection(result);
      
      console.log('Détection bot:', result);
      
      // Seuil plus élevé pour éviter les faux positifs
      if (result.isBot && result.confidence > 85) {
        // Bot détecté avec très haute confiance - redirection immédiate
        console.log(`Bot ${result.botType} détecté - Redirection vers ${result.redirectUrl}`);
        
        // Petit délai pour éviter la détection de redirection automatique
        setTimeout(() => {
          if (result.redirectUrl) {
            window.location.replace(result.redirectUrl);
          }
        }, 500); // Réduit à 500ms
        return;
      }
      
      if (result.isBot && result.confidence > 70) {
        // Bot possible - montrer un challenge rapide
        setShowChallenge(true);
        return;
      }
      
      // Probablement humain - démarrer le countdown réduit
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
    
    // Attendre une interaction humaine (timeout réduit)
    const hasInteraction = await waitForHumanInteraction(3000);
    
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
    
    // Challenge mathématique rapide
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
  if (detection?.isBot && detection?.confidence > 85) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-100 to-orange-100 p-4">
        <Card className="max-w-md w-full shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Bot className="h-6 w-6" />
              Accès automatisé détecté
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <p className="text-sm text-red-800">
                  Bot {detection.botType} détecté (confiance: {detection.confidence}%)
                </p>
              </div>
              
              <p className="text-gray-600">
                Redirection en cours vers une plateforme appropriée...
              </p>
              
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-500">Redirection automatique</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si bot possible, afficher le challenge rapide
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
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  Vérification de sécurité (score: {detection?.confidence}%)
                </p>
              </div>
              
              {challengeStep === 0 && (
                <>
                  <p className="text-gray-600">
                    Vérification rapide requise pour accéder au contenu.
                  </p>
                  
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <p className="text-sm font-mono break-all text-gray-800">
                      Destination: {originalUrl}
                    </p>
                  </div>
                  
                  <Button 
                    onClick={handleHumanChallenge}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Vérifier et continuer
                  </Button>
                </>
              )}
              
              {challengeStep === 1 && (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Cliquez n'importe où ou bougez la souris...
                  </p>
                  <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              )}
              
              {challengeStep === 2 && (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Dernière vérification...
                  </p>
                  <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Affichage normal pour les humains (countdown réduit)
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
            <div className="flex items-center justify-center gap-2 mb-4">
              <User className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-700">Utilisateur vérifié</span>
            </div>
            
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