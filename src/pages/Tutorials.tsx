import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Search, 
  Filter,
  Clock,
  User,
  CheckCircle,
  Star,
  Lightbulb
} from 'lucide-react';
import TutorialCard from '@/components/TutorialCard';
import TutorialModal from '@/components/TutorialModal';
import { tutorials, getTutorialById } from '@/data/tutorials';

const Tutorials = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedTutorial, setSelectedTutorial] = useState<string | null>(null);
  const [completedTutorials, setCompletedTutorials] = useState<Set<string>>(new Set());

  const filteredTutorials = tutorials.filter(tutorial => {
    const matchesSearch = tutorial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tutorial.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || tutorial.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesDifficulty;
  });

  const handleStartTutorial = (tutorialId: string) => {
    setSelectedTutorial(tutorialId);
  };

  const handleCloseTutorial = () => {
    if (selectedTutorial) {
      setCompletedTutorials(prev => new Set([...prev, selectedTutorial]));
    }
    setSelectedTutorial(null);
  };

  const currentTutorial = selectedTutorial ? getTutorialById(selectedTutorial) : null;

  const difficultyColors = {
    'Débutant': 'bg-green-100 text-green-700 border-green-200',
    'Intermédiaire': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Avancé': 'bg-red-100 text-red-700 border-red-200'
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
  <Card className="bg-yellow-50 border-yellow-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl text-yellow-600">
            <BookOpen className="h-6 w-6" />
            Centre d'apprentissage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {tutorials.length}
              </div>
              <div className="text-sm text-gray-600">Tutoriels disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {completedTutorials.size}
              </div>
              <div className="text-sm text-gray-600">Tutoriels terminés</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">
                {Math.round((completedTutorials.size / tutorials.length) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Progression</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Barre de recherche et filtres */}
      <Card className="shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher un tutoriel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedDifficulty === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedDifficulty('all')}
                size="sm"
              >
                Tous
              </Button>
              <Button
                variant={selectedDifficulty === 'Débutant' ? 'default' : 'outline'}
                onClick={() => setSelectedDifficulty('Débutant')}
                size="sm"
                className="text-green-600 border-green-200"
              >
                <User className="h-4 w-4 mr-1" />
                Débutant
              </Button>
              <Button
                variant={selectedDifficulty === 'Intermédiaire' ? 'default' : 'outline'}
                onClick={() => setSelectedDifficulty('Intermédiaire')}
                size="sm"
                className="text-yellow-600 border-yellow-200"
              >
                <Star className="h-4 w-4 mr-1" />
                Intermédiaire
              </Button>
              <Button
                variant={selectedDifficulty === 'Avancé' ? 'default' : 'outline'}
                onClick={() => setSelectedDifficulty('Avancé')}
                size="sm"
                className="text-red-600 border-red-200"
              >
                <Lightbulb className="h-4 w-4 mr-1" />
                Avancé
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tutoriels recommandés */}
      {completedTutorials.size === 0 && (
  <Card className="bg-orange-50 border-orange-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <Star className="h-5 w-5" />
              Recommandé pour commencer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700 mb-4">
              Nouveau sur ShortLink Pro ? Commencez par ce tutoriel pour maîtriser les bases !
            </p>
            <TutorialCard
              tutorial={{
                ...tutorials[0],
                stepsCount: tutorials[0].steps.length
              }}
              onStart={handleStartTutorial}
            />
          </CardContent>
        </Card>
      )}

      {/* Liste des tutoriels */}
      {filteredTutorials.length === 0 ? (
        <Card className="shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-2">
                Aucun tutoriel ne correspond à vos critères
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDifficulty('all');
                }}
              >
                Effacer les filtres
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTutorials.map(tutorial => (
            <div key={tutorial.id} className="relative">
              {completedTutorials.has(tutorial.id) && (
                <div className="absolute -top-2 -right-2 z-10">
                  <div className="bg-green-500 text-white rounded-full p-1">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                </div>
              )}
              <TutorialCard
                tutorial={{
                  ...tutorial,
                  stepsCount: tutorial.steps.length
                }}
                onStart={handleStartTutorial}
              />
            </div>
          ))}
        </div>
      )}

      {/* Conseils rapides */}
  <Card className="bg-amber-50 border-amber-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-400">
            <Lightbulb className="h-5 w-5" />
            Conseils rapides
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-amber-800">💡 Le saviez-vous ?</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Vous pouvez créer des QR codes pour tous vos liens</li>
                <li>• Les liens directs sont parfaits pour les intégrations API</li>
                <li>• Les tags vous aident à organiser vos campagnes</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-amber-800">🚀 Raccourcis clavier</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• <kbd className="bg-white px-1 rounded">Ctrl+V</kbd> pour coller une URL</li>
                <li>• <kbd className="bg-white px-1 rounded">Enter</kbd> pour raccourcir</li>
                <li>• <kbd className="bg-white px-1 rounded">Ctrl+C</kbd> pour copier le résultat</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal du tutoriel */}
      <TutorialModal
        isOpen={!!selectedTutorial}
        onClose={handleCloseTutorial}
        tutorial={currentTutorial}
      />
    </div>
  );
};

export default Tutorials;