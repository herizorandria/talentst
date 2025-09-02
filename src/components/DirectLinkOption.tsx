
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Zap } from 'lucide-react';

interface DirectLinkOptionProps {
  directLink: boolean;
  setDirectLink: (value: boolean) => void;
}

const DirectLinkOption = ({ directLink, setDirectLink }: DirectLinkOptionProps) => {
  return (
    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-orange-600" />
        <div>
          <Label htmlFor="direct-link" className="text-sm font-medium text-orange-800">
            Lien direct
          </Label>
          <p className="text-xs text-orange-600">
            Redirige immédiatement sans page de confirmation
          </p>
        </div>
      </div>
      <Switch
        id="direct-link"
        checked={directLink}
        onCheckedChange={setDirectLink}
      />
    </div>
  );
};

export default DirectLinkOption;
