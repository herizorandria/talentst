import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Quote, Globe, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const philosophicalQuotes = [
  {
    quote: "La sagesse commence dans l'émerveillement.",
    author: "Socrate"
  },
  {
    quote: "Il n'y a qu'une route vers le bonheur, c'est de cesser de se faire du souci pour les choses qui ne dépendent pas de notre volonté.",
    author: "Épictète"
  },
  {
    quote: "La liberté n'est pas de faire ce que l'on veut, mais de vouloir ce que l'on fait.",
    author: "Jean-Paul Sartre"
  },
  {
    quote: "Connais-toi toi-même et tu connaîtras l'univers et les dieux.",
    author: "Socrate"
  },
  {
    quote: "L'homme n'est rien d'autre que ce qu'il se fait.",
    author: "Jean-Paul Sartre"
  },
  {
    quote: "Il vaut mieux penser le changement que changer le pansement.",
    author: "Francis Blanche"
  },
  {
    quote: "Le bonheur n'est pas une destination, c'est une façon de voyager.",
    author: "Margaret Lee Runbeck"
  },
  {
    quote: "Celui qui sait qu'il ne sait rien sait déjà beaucoup.",
    author: "Confucius"
  },
  {
    quote: "La patience est un arbre dont la racine est amère et les fruits très doux.",
    author: "Proverbe persan"
  },
  {
    quote: "Il n'existe rien de constant si ce n'est le changement.",
    author: "Héraclite"
  },
  {
    quote: "L'expérience est le nom que chacun donne à ses erreurs.",
    author: "Oscar Wilde"
  },
  {
    quote: "La vraie générosité envers l'avenir consiste à tout donner au présent.",
    author: "Albert Camus"
  },
  {
    quote: "Il faut toujours viser la lune, car même en cas d'échec, on atterrit dans les étoiles.",
    author: "Oscar Wilde"
  },
  {
    quote: "Le courage n'est pas l'absence de peur, mais la capacité de la vaincre.",
    author: "Nelson Mandela"
  },
  {
    quote: "La plus grande révolution de notre génération est la découverte que l'être humain, en changeant l'attitude de ses pensées intérieures, peut changer les aspects extérieurs de sa vie.",
    author: "William James"
  }
];

const PhilosophicalQuotes = () => {
  const [currentQuote, setCurrentQuote] = useState(philosophicalQuotes[0]);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  const generateNewQuote = () => {
    setIsAnimating(true);
    
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * philosophicalQuotes.length);
      setCurrentQuote(philosophicalQuotes[randomIndex]);
      setIsAnimating(false);
    }, 300);
  };

  useEffect(() => {
    // Generate a random quote on page load
    generateNewQuote();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        
        {/* Header Card */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-3 text-2xl text-indigo-800">
              <Globe className="h-8 w-8" />
              Accès Restreint
            </CardTitle>
            <p className="text-gray-600 mt-2">
              L'accès à ce contenu n'est pas disponible depuis votre région.
            </p>
          </CardHeader>
        </Card>

        {/* Quote Card */}
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className={`text-center transition-all duration-300 ${isAnimating ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}`}>
              <Quote className="h-12 w-12 text-indigo-400 mx-auto mb-6" />
              
              <blockquote className="text-xl md:text-2xl font-medium text-gray-800 leading-relaxed mb-6 italic">
                "{currentQuote.quote}"
              </blockquote>
              
              <div className="flex items-center justify-center">
                <div className="h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent w-24 mr-4"></div>
                <cite className="text-lg font-semibold text-indigo-700">
                  {currentQuote.author}
                </cite>
                <div className="h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent w-24 ml-4"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={generateNewQuote}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
            disabled={isAnimating}
          >
            <RefreshCw className={`h-4 w-4 ${isAnimating ? 'animate-spin' : ''}`} />
            Nouvelle Citation
          </Button>
          
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Prenez ce moment pour réfléchir et revenir plus tard.</p>
        </div>
      </div>
    </div>
  );
};

export default PhilosophicalQuotes;