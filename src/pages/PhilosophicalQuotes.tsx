import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Quote, Globe, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Citation = { id: number; texte: string };

const PhilosophicalQuotes = () => {
  const [citations, setCitations] = useState<Citation[]>([]);
  const [currentQuote, setCurrentQuote] = useState<Citation | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  const getDayOfYear = (date: Date) => {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    const start = Date.UTC(year, 0, 0);
    const now = Date.UTC(year, month, day);
    return Math.floor((now - start) / 86400000);
  };

  const selectDailyQuote = (list: Citation[]) => {
    if (!list || list.length === 0) return null;
    const today = new Date();
    const dayOfYear = getDayOfYear(today);
    const index = dayOfYear % list.length;
    return list[index];
  };

  useEffect(() => {
    const loadCitations = async () => {
      try {
        const res = await fetch('/citation.json');
        const json = await res.json();
        const list: Citation[] = Array.isArray(json.citations) ? json.citations : [];
        setCitations(list);
        const daily = selectDailyQuote(list);
        if (daily) setCurrentQuote(daily);
      } catch (e) {
        // fallback simple en cas d'erreur
        setCitations([]);
      }
    };
    loadCitations();
  }, []);

  return (
    <div className="min-h-screen bg-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">

        {/* Header Card */}
        {/*<Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-3 text-2xl text-indigo-800">
              <Globe className="h-8 w-8" />
              Accès Restreint
            </CardTitle>
            <p className="text-gray-600 mt-2">
              L'accès à ce contenu n'est pas disponible depuis votre région.
            </p>
          </CardHeader>
        </Card>*/}

        {/* Quote Card */}
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className={`text-center transition-all duration-300 ${isAnimating ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}`}>
              <Quote className="h-12 w-12 text-indigo-400 mx-auto mb-6" />

              {currentQuote && (
                <blockquote className="text-xl md:text-2xl font-medium text-gray-800 leading-relaxed mb-6 italic">
                  "{currentQuote.texte}"
                </blockquote>
              )}

              <div className="flex items-center justify-center">
                <div className="h-px bg-indigo-300 w-24 mr-4"></div>
                <cite className="text-lg font-semibold text-indigo-700">&nbsp;</cite>
                <div className="h-px bg-indigo-300 w-24 ml-4"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        {/*<div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Button>
        </div>*/}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Prenez ce moment pour réfléchir et revenir plus tard.</p>
        </div>
      </div>
    </div>
  );
};

export default PhilosophicalQuotes;