import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

import { Input } from '@/components/ui/input';

interface AddDayModalProps {
  existingDates: string[];
  onAddDay: (date: string, companyName?: string) => void;
}

export function AddDayModal({ existingDates, onAddDay }: AddDayModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [companyName, setCompanyName] = useState('');

  const handleAddDay = () => {
    if (selectedDate) {
      const formattedDate = format(selectedDate, 'dd/MM/yyyy');
      onAddDay(formattedDate, companyName);
      setSelectedDate(undefined);
      setCompanyName('');
      setOpen(false);
    }
  };

  const isDateDisabled = (date: Date) => {
    const formattedDate = format(date, 'dd/MM/yyyy');
    return existingDates.includes(formattedDate);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 border-dashed border-2 hover:border-primary hover:bg-primary-light transition-all"
        >
          <Plus size={18} />
          Add New Day
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Add New Schedule Day
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center py-4">
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={isDateDisabled}
            className="rounded-lg border pointer-events-auto mb-4"
          />

          <div className="w-full px-4 space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Company / Event Name (Optional)
            </label>
            <Input
              placeholder="e.g. Acme Corp Event"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          {selectedDate && (
            <div className="mt-4 p-3 rounded-lg bg-primary-light w-full text-center">
              <p className="text-sm text-muted-foreground">Selected date:</p>
              <p className="text-lg font-semibold text-primary">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddDay} disabled={!selectedDate}>
            <Plus size={16} className="mr-1" />
            Add Day
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
