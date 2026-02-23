import { useState } from 'react';
import { DaySchedule, ActivityStatus } from '@/types/schedule';
import { ActivityCard } from './ActivityCard';
import { AddActivityForm } from './AddActivityForm';
import { ChevronDown, ChevronRight, Plus, Pencil, Check, X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface DayAccordionProps {
  daySchedule: DaySchedule;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdateActivity: (activityId: string, updates: { status?: ActivityStatus; time?: string; title?: string }) => void;
  onAddActivity: (time: string, title: string) => void;
  onDeleteActivity: (activityId: string) => void;
  onUpdateDay: (updates: { companyName: string }) => void;
  onDeleteDay: () => void;
}

export function DayAccordion({
  daySchedule,
  isExpanded,
  onToggle,
  onUpdateActivity,
  onAddActivity,
  onDeleteActivity,
  onUpdateDay,
  onDeleteDay
}: DayAccordionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [companyNameDraft, setCompanyNameDraft] = useState(daySchedule.companyName || '');

  const totalActivities = daySchedule.activities.length;
  const completedCount = daySchedule.activities.filter(a => a.status === 'done').length;
  const cancelledCount = daySchedule.activities.filter(a => a.status === 'cancelled').length;
  const inProgressCount = daySchedule.activities.filter(a => a.status === 'in progress').length;

  const handleAddActivity = (time: string, title: string) => {
    onAddActivity(time, title);
    setIsAdding(false);
  };

  const handleSaveName = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateDay({ companyName: companyNameDraft });
    setIsEditingName(false);
  };

    const handleCancelName = (e: React.MouseEvent) => {
      e.stopPropagation();
      setCompanyNameDraft(daySchedule.companyName || '');
      setIsEditingName(false);
    };

    const handleDeleteDay = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (window.confirm(`Are you sure you want to delete all tasks for ${daySchedule.date}? This action cannot be undone.`)) {
        onDeleteDay();
      }
    };

    return (
      <div className="animate-fade-in">
      {/* Accordion Header */}
      <div
        onClick={onToggle}
        className={cn(
          'w-full flex items-center gap-4 px-5 py-4 rounded-lg transition-all duration-200 cursor-pointer',
          'bg-primary-light hover:bg-primary/10',
          isExpanded && 'rounded-b-none'
        )}
      >
        <span className="text-primary">
          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </span>

        <span className="text-base font-semibold text-primary min-w-[100px]">
          {daySchedule.date}
        </span>

        {/* Company Name / Edit Section */}
        <div className="flex-1 flex items-center gap-2 ml-4">
          {isEditingName ? (
              <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-2">
                <Input
                  value={companyNameDraft}
                  onChange={(e) => setCompanyNameDraft(e.target.value)}
                  className="h-8 w-[200px] text-sm bg-card"
                  placeholder="Company Name"
                />
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-success hover:text-success hover:bg-success/10" onClick={handleSaveName}>
                  <Check size={16} />
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleCancelName}>
                  <X size={16} />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                {daySchedule.companyName ? (
                  <span className="text-sm font-medium text-foreground bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                    {daySchedule.companyName}
                  </span>
                ) : (
                  <span 
                    onClick={(e) => { e.stopPropagation(); setCompanyNameDraft(''); setIsEditingName(true); }}
                    className="text-sm text-muted-foreground italic cursor-pointer hover:text-primary transition-colors"
                  >
                    Add Company Name...
                  </span>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); setCompanyNameDraft(daySchedule.companyName || ''); setIsEditingName(true); }}
                  className="p-1.5 hover:bg-accent rounded-full text-muted-foreground hover:text-primary transition-colors focus:ring-2 focus:ring-primary focus:outline-none"
                  title="Edit Company Name"
                >
                  <Pencil size={14} />
                </button>
              </div>
            )}
          </div>


          <div className="flex items-center gap-3 ml-auto text-sm">
            <span className="text-muted-foreground">
              {totalActivities} activities
            </span>
            <span className="px-2 py-0.5 rounded-full bg-success-light text-success text-xs font-medium">
              {completedCount} done
            </span>
            {inProgressCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-in-progress-light text-in-progress text-xs font-medium">
                {inProgressCount} in progress
              </span>
            )}
            {cancelledCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-destructive-light text-destructive text-xs font-medium">
                {cancelledCount} cancelled
              </span>
            )}
            
            <button
              onClick={handleDeleteDay}
              className="p-2 hover:bg-destructive/10 rounded-full text-slate-400 hover:text-destructive transition-colors focus:ring-2 focus:ring-destructive focus:outline-none ml-2"
              title="Delete Day"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

      {/* Accordion Content */}
      {isExpanded && (
        <div className="bg-card rounded-b-lg border border-t-0 border-border p-4 space-y-2 animate-slide-down">
          {/* Add Activity Form */}
          {isAdding && (
            <AddActivityForm
              onAdd={handleAddActivity}
              onCancel={() => setIsAdding(false)}
            />
          )}

          {/* Activities List */}
          {daySchedule.activities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onUpdateStatus={(id, status) => onUpdateActivity(id, { status })}
              onUpdateTime={(id, time) => onUpdateActivity(id, { time })}
              onUpdateTitle={(id, title) => onUpdateActivity(id, { title })}
              onDelete={onDeleteActivity}
            />
          ))}

          {/* Add Activity Button */}
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-4 py-2 mt-3 text-sm font-medium text-primary hover:bg-primary-light rounded-lg transition-colors"
            >
              <Plus size={18} />
              Add Activity
            </button>
          )}
        </div>
      )}
    </div>
  );
}
