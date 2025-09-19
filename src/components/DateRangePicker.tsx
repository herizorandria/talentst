import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

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
  const [selectingEnd, setSelectingEnd] = useState(false);

  useEffect(() => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
  }, [startDate, endDate]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    if (!tempStartDate || selectingEnd) {
      if (!tempStartDate) {
        setTempStartDate(date);
        setSelectingEnd(true);
      } else if (selectingEnd) {
        if (date >= tempStartDate) {
          setTempEndDate(date);
          setSelectingEnd(false);
        } else {
          // Si la date sélectionnée est antérieure, on recommence
          setTempStartDate(date);
          setTempEndDate(null);
          setSelectingEnd(true);
        }
      }
    } else {
      // Déjà une date de début sélectionnée, sélectionner la fin
      if (date >= tempStartDate) {
        setTempEndDate(date);
        setSelectingEnd(false);
      } else {
        // Si la date est antérieure, recommencer avec cette date comme début
        setTempStartDate(date);
        setTempEndDate(null);
        setSelectingEnd(true);
      }
    }
  };

  const handleApply = () => {
    onDateRangeChange(tempStartDate, tempEndDate);
    setIsOpen(false);
    setSelectingEnd(false);
  };

  const handleReset = () => {
    setTempStartDate(null);
    setTempEndDate(null);
    setSelectingEnd(false);
    onDateRangeChange(null, null);
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSelectingEnd(false);
      // Restaurer les valeurs originales si on ferme sans appliquer
      setTempStartDate(startDate);
      setTempEndDate(endDate);
    }
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

  const getModifiers = () => {
    const modifiers: any = {};
    
    if (tempStartDate) {
      modifiers.start = tempStartDate;
    }
    
    if (tempEndDate) {
      modifiers.end = tempEndDate;
    }
    
    if (tempStartDate && tempEndDate) {
      modifiers.range_start = tempStartDate;
      modifiers.range_end = tempEndDate;
      modifiers.range_middle = (date: Date) => {
        return date > tempStartDate && date < tempEndDate;
      };
    }
    
    return modifiers;
  };

  const getModifiersClassNames = () => {
    return {
      start: "bg-primary text-primary-foreground rounded-l-md",
      end: "bg-primary text-primary-foreground rounded-r-md",
      range_start: "bg-primary text-primary-foreground rounded-l-md",
      range_end: "bg-primary text-primary-foreground rounded-r-md",
      range_middle: "bg-primary/20 text-primary-foreground",
    };
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "w-64 justify-start text-left font-normal",
            (!startDate && !endDate) && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDateRange()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-background border shadow-md z-50" align="start">
        <div className="p-4 space-y-4 bg-background">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">
              {selectingEnd ? "Sélectionnez la date de fin" : "Sélectionnez la date de début"}
            </h4>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => handleOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {(tempStartDate || tempEndDate) && (
            <div className="text-sm text-muted-foreground">
              {tempStartDate && (
                <div>Début: {format(tempStartDate, 'dd/MM/yyyy', { locale: fr })}</div>
              )}
              {tempEndDate && (
                <div>Fin: {format(tempEndDate, 'dd/MM/yyyy', { locale: fr })}</div>
              )}
            </div>
          )}
          
          <Calendar
            mode="single"
            selected={selectingEnd ? tempEndDate || undefined : tempStartDate || undefined}
            onSelect={handleDateSelect}
            locale={fr}
            modifiers={getModifiers()}
            modifiersClassNames={getModifiersClassNames()}
            className={cn("rounded-md border pointer-events-auto")}
            initialFocus
          />
          
          <div className="flex gap-2 pt-2 border-t">
            <Button 
              onClick={handleApply} 
              size="sm"
              disabled={!tempStartDate}
              className="flex-1"
            >
              Appliquer
            </Button>
            <Button 
              onClick={handleReset} 
              variant="outline" 
              size="sm"
              className="flex-1"
            >
              Réinitialiser
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DateRangePicker;