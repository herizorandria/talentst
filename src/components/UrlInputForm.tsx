
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Shuffle } from 'lucide-react';

interface UrlInputFormProps {
  originalUrl: string;
  setOriginalUrl: (value: string) => void;
  customCode: string;
  setCustomCode: (value: string) => void;
  onGenerateRandomCode: () => void;
}

const UrlInputForm = ({
  originalUrl,
  setOriginalUrl,
  customCode,
  setCustomCode,
  onGenerateRandomCode
}: UrlInputFormProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Input
          type="url"
          placeholder="https://example.com/tres-long-lien-a-raccourcir"
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          className="h-12 text-lg border-amber-200 focus:border-amber-400"
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Personnaliser votre lien court
        </label>
        <div className="flex gap-2">
          <div className="flex-1 flex">
            <div className="flex items-center px-3 bg-gray-100 border border-r-0 border-amber-200 rounded-l-md text-sm text-gray-600">
              {window.location.origin}/
            </div>
            <Input
              type="text"
              placeholder="mon-lien-perso"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value.replace(/[^a-zA-Z0-9-]/g, ''))}
              className="h-10 border-amber-200 focus:border-amber-400 rounded-l-none"
              maxLength={20}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={onGenerateRandomCode}
            className="h-10 px-3 border-amber-200 hover:bg-amber-50"
          >
            <Shuffle className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          Laissez vide pour un code automatique ou utilisez le bouton pour générer aléatoirement
        </p>
      </div>
    </div>
  );
};

export default UrlInputForm;
