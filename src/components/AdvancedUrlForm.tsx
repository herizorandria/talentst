
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Settings, Calendar, Lock, Tag } from 'lucide-react';

interface AdvancedUrlFormProps {
  description: string;
  setDescription: (value: string) => void;
  tags: string;
  setTags: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  expiresAt: string;
  setExpiresAt: (value: string) => void;
  blockedCountries?: string;
  setBlockedCountries?: (value: string) => void;
  blockedIPs?: string;
  setBlockedIPs?: (value: string) => void;
}

const AdvancedUrlForm = ({
  description,
  setDescription,
  tags,
  setTags,
  password,
  setPassword,
  expiresAt,
  setExpiresAt,
  blockedCountries = '',
  setBlockedCountries,
  blockedIPs = '',
  setBlockedIPs
}: AdvancedUrlFormProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full border-amber-200 hover:bg-amber-50"
        >
          <Settings className="h-4 w-4 mr-2" />
          Options avancées
          {isOpen ? <ChevronUp className="h-4 w-4 ml-auto" /> : <ChevronDown className="h-4 w-4 ml-auto" />}
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-4 mt-4">
  <Card className="bg-gray-50 border-amber-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-amber-600">
              Paramètres avancés
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Tag className="h-4 w-4" />
                Description
              </label>
              <Textarea
                placeholder="Décrivez votre lien (optionnel)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[80px] border-amber-200 focus:border-amber-400"
                maxLength={200}
              />
              <p className="text-xs text-gray-500">
                {description.length}/200 caractères
              </p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Tag className="h-4 w-4" />
                Tags
              </label>
              <Input
                type="text"
                placeholder="marketing, social, campagne..."
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="border-amber-200 focus:border-amber-400"
              />
              <p className="text-xs text-gray-500">
                Séparez les tags par des virgules
              </p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Lock className="h-4 w-4" />
                Mot de passe (optionnel)
              </label>
              <Input
                type="password"
                placeholder="Protégez votre lien"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-amber-200 focus:border-amber-400"
              />
              <p className="text-xs text-gray-500">
                Le lien nécessitera un mot de passe pour être accessible
              </p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Calendar className="h-4 w-4" />
                Date d'expiration (optionnel)
              </label>
              <Input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                min={today}
                className="border-amber-200 focus:border-amber-400"
              />
              <p className="text-xs text-gray-500">
                Le lien expirera automatiquement à cette date
              </p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Tag className="h-4 w-4" />
                Pays bloqués (codes ou noms, séparés par virgules)
              </label>
              <Input
                type="text"
                placeholder="FR, US, Madagascar, Iran..."
                value={blockedCountries}
                onChange={(e) => setBlockedCountries && setBlockedCountries(e.target.value)}
                className="border-amber-200 focus:border-amber-400"
              />
              <p className="text-xs text-gray-500">
                Correspondances souples (ex: "fr" ou "France"). Laisser vide pour aucun blocage.
              </p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Tag className="h-4 w-4" />
                IPs bloquées (séparées par virgules)
              </label>
              <Input
                type="text"
                placeholder="1.2.3.4, 5.6.7.8"
                value={blockedIPs}
                onChange={(e) => setBlockedIPs && setBlockedIPs(e.target.value)}
                className="border-amber-200 focus:border-amber-400"
              />
              <p className="text-xs text-gray-500">
                Entrez des adresses IPv4/IPv6 exactes. Laisser vide pour aucun blocage.
              </p>
            </div>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default AdvancedUrlForm;
