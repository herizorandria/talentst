import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Clock, User } from 'lucide-react';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé';
  icon: React.ReactNode;
  stepsCount: number;
}

interface TutorialCardProps {
  tutorial: Tutorial;
  onStart: (tutorialId: string) => void;
}

const TutorialCard = ({ tutorial, onStart }: TutorialCardProps) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Débutant': return 'bg-green-100 text-green-700 border-green-200';
      case 'Intermédiaire': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Avancé': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
  <Card className="h-full hover:shadow-lg transition-all duration-200 hover:border-amber-300 group">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
              {tutorial.icon}
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-800 group-hover:text-yellow-400 transition-colors">
                {tutorial.title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getDifficultyColor(tutorial.difficulty)}>
                  <User className="h-3 w-3 mr-1" />
                  {tutorial.difficulty}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {tutorial.duration}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-gray-600 mb-4 line-clamp-3">
          {tutorial.description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {tutorial.stepsCount} étapes
          </span>
          
          <Button
            onClick={() => onStart(tutorial.id)}
            className="bg-yellow-400 hover:bg-amber-700 text-white"
            size="sm"
          >
            <Play className="h-4 w-4 mr-2" />
            Commencer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TutorialCard;