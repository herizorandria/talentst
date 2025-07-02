import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Play,
  CheckCircle,
  Link,
  Settings,
  Eye,
  Shield,
  Zap,
  QrCode,
  BarChart3,
  History
} from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  tips?: string[];
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé';
  steps: TutorialStep[];
}

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutorial: Tutorial | null;
}

const TutorialModal = ({ isOpen, onClose, tutorial }: TutorialModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Reset state when modal opens or tutorial changes
  useEffect(() => {
    if (isOpen && tutorial) {
      setCurrentStep(0);
      setCompletedSteps(new Set());
    }
  }, [isOpen, tutorial]);

  if (!tutorial) return null;

  const handleNextStep = () => {
    if (currentStep < tutorial.steps.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const handleComplete = () => {
    setCompletedSteps(prev => new Set([...prev, currentStep]));
    onClose();
  };

  const currentStepData = tutorial.steps[currentStep];
  const isLastStep = currentStep === tutorial.steps.length - 1;

  // Safety check to prevent accessing undefined step data
  if (!currentStepData) {
    return null;
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Débutant': return 'bg-green-100 text-green-700';
      case 'Intermédiaire': return 'bg-yellow-100 text-yellow-700';
      case 'Avancé': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-purple-600">
                {tutorial.title}
              </DialogTitle>
              <DialogDescription className="mt-2">
                {tutorial.description}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getDifficultyColor(tutorial.difficulty)}>
                {tutorial.difficulty}
              </Badge>
              <Badge variant="outline">
                {tutorial.duration}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="flex h-[600px]">
          {/* Sidebar avec les étapes */}
          <div className="w-1/3 border-r pr-4 overflow-y-auto">
            <h3 className="font-semibold mb-4 text-gray-700">Étapes du tutoriel</h3>
            <div className="space-y-2">
              {tutorial.steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(index)}
                  className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                    currentStep === index
                      ? 'border-purple-300 bg-purple-50'
                      : completedSteps.has(index)
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      currentStep === index
                        ? 'bg-purple-100 text-purple-600'
                        : completedSteps.has(index)
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {completedSteps.has(index) ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        step.icon
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{step.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Étape {index + 1} sur {tutorial.steps.length}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Contenu principal */}
          <div className="flex-1 pl-6 overflow-y-auto">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  {currentStepData.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {currentStepData.title}
                  </h2>
                  <p className="text-gray-600">
                    Étape {currentStep + 1} sur {tutorial.steps.length}
                  </p>
                </div>
              </div>

              <p className="text-gray-700 mb-6">
                {currentStepData.description}
              </p>

              {/* Contenu de l'étape */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                {currentStepData.content}
              </div>

              {/* Conseils */}
              {currentStepData.tips && currentStepData.tips.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">💡 Conseils :</h4>
                  <ul className="space-y-1">
                    {currentStepData.tips.map((tip, index) => (
                      <li key={index} className="text-blue-700 text-sm">
                        • {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="border-t pt-4 flex items-center justify-between">
          <Button
            onClick={handlePrevStep}
            disabled={currentStep === 0}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </Button>

          <div className="flex items-center gap-2">
            {tutorial.steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep
                    ? 'bg-purple-600'
                    : completedSteps.has(index)
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {isLastStep ? (
            <Button
              onClick={handleComplete}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4" />
              Terminer
            </Button>
          ) : (
            <Button
              onClick={handleNextStep}
              className="flex items-center gap-2"
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TutorialModal;