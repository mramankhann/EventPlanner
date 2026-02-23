import { useState } from 'react';
import { Plus, Clock, FileText, CalendarDays } from 'lucide-react';
import { DaySchedule, ActivityStatus } from '@/types/schedule';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface CreateTaskModalProps {
  schedules: DaySchedule[];
  onCreateTask: (dayDate: string, time: string, title: string, status: ActivityStatus) => void;
  fixedDate?: string;
}

export function CreateTaskModal({ schedules, onCreateTask, fixedDate }: CreateTaskModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [time, setTime] = useState('09:00');
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<ActivityStatus>('upcoming');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDay && time && title.trim()) {
      onCreateTask(selectedDay, time, title.trim(), status);
      resetForm();
      setOpen(false);
    }
  };

  const resetForm = () => {
    setSelectedDay('');
    setTime('09:00');
    setTitle('');
    setStatus('upcoming');
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (val && fixedDate) {
        setSelectedDay(fixedDate);
      }
    }}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-medium hover:shadow-elevated transition-all">
          <Plus size={18} />
          Create Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-lg bg-primary-light">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            Create New Task
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2 text-sm font-medium text-foreground">
              <FileText size={16} className="text-muted-foreground" />
              Task Title
            </Label>
            <Textarea
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title here..."
              className="min-h-[80px] resize-none text-foreground"
            />
          </div>
          {/* Day Selection */}
          <div className="space-y-2">
            <Label htmlFor="day" className="flex items-center gap-2 text-sm font-medium text-foreground">
              <CalendarDays size={16} className="text-muted-foreground" />
              Select Day
            </Label>
            {fixedDate ? (
              <div className="p-3 bg-muted rounded-md text-sm font-medium border border-border text-foreground">
                {fixedDate} (Today)
              </div>
            ) : (
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger className="text-foreground">
                  <SelectValue placeholder="Choose a day..." />
                </SelectTrigger>
                <SelectContent>
                  {schedules.map(day => (
                    <SelectItem key={day.date} value={day.date} className="text-foreground">
                      {day.date} ({day.activities.length} tasks)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Time */}
          <div className="space-y-2">
            <Label htmlFor="time" className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Clock size={16} className="text-muted-foreground" />
              Time
            </Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full text-foreground"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Initial Status</Label>
            <div className="grid grid-cols-2 gap-2">
              {(['upcoming', 'in progress', 'done', 'cancelled'] as ActivityStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`
                    p-3 rounded-lg border-2 text-sm font-medium transition-all
                    ${status === s
                      ? s === 'upcoming' ? 'border-upcoming bg-upcoming-light text-upcoming'
                        : s === 'in progress' ? 'border-in-progress bg-in-progress-light text-in-progress'
                          : s === 'done' ? 'border-success bg-success-light text-success'
                            : 'border-destructive bg-destructive-light text-destructive'
                      : 'border-border bg-card hover:border-muted-foreground text-foreground'
                    }
                  `}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="text-foreground hover:text-foreground">
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedDay || !time || !title.trim()}>
              <Plus size={16} className="mr-1" />
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
