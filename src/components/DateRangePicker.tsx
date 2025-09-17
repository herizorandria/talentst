import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onDateRangeChange: (startDate: Date | null, endDate: Date | null) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onDateRangeChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date | null>(startDate);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(endDate);

  const handleApply = () => {
    onDateRangeChange(tempStartDate, tempEndDate);
    setIsOpen(false);
  };

  const handleReset = () => {
    setTempStartDate(null);
    setTempEndDate(null);
    onDateRangeChange(null, null);
    setIsOpen(false);
  };

  const formatDateRange = () => {
    if (!startDate && !endDate) return 'Sélectionner une période';
    if (startDate && !endDate) return `Du ${format(startDate, 'dd/MM/yyyy', { locale: fr })}`;
    if (!startDate && endDate) return `Jusqu'au ${format(endDate, 'dd/MM/yyyy', { locale: fr })}`;
    if (startDate && endDate) {
      return `${format(startDate, 'dd/MM/yyyy', { locale: fr })} - ${format(endDate, 'dd/MM/yyyy', { locale: fr })}`;
    }
    return 'Sélectionner une période';
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-64 justify-start text-left font-normal">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDateRange()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Date de début</label>
            <Calendar
              mode="single"
              selected={tempStartDate || undefined}
              onSelect={(date) => setTempStartDate(date || null)}
              locale={fr}
              className="rounded-md border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Date de fin</label>
            <Calendar
              mode="single"
              selected={tempEndDate || undefined}
              onSelect={(date) => setTempEndDate(date || null)}
              locale={fr}
              className="rounded-md border"
              disabled={(date) => tempStartDate ? date < tempStartDate : false}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleApply} size="sm">
              Appliquer
            </Button>
            <Button onClick={handleReset} variant="outline" size="sm">
              Réinitialiser
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DateRangePicker;