import { useState } from 'react';
import { Activity, ActivityStatus } from '@/types/schedule';
import { StatusBadge } from './StatusBadge';
import { cn } from '@/lib/utils';
import { Check, Clock, Pencil, Trash2, X } from 'lucide-react';

interface ActivityCardProps {
  activity: Activity;
  onUpdateStatus: (id: string, status: ActivityStatus) => void;
  onUpdateTime: (id: string, time: string) => void;
  onUpdateTitle?: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

const statusBorderColors = {
  'done': 'border-l-success',
  'in progress': 'border-l-in-progress',
  'upcoming': 'border-l-upcoming',
  'cancelled': 'border-l-destructive',
};

const statusBgColors = {
  'done': 'bg-success-light',
  'in progress': 'bg-in-progress-light',
  'upcoming': 'bg-upcoming-light',
  'cancelled': 'bg-destructive-light',
};

export function ActivityCard({ activity, onUpdateStatus, onUpdateTime, onUpdateTitle, onDelete }: ActivityCardProps) {
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editedTime, setEditedTime] = useState(activity.time);
  const [editedTitle, setEditedTitle] = useState(activity.title);

  const handleSaveTime = () => {
    onUpdateTime(activity.id, editedTime);
    if (activity.title !== editedTitle && onUpdateTitle) {
      onUpdateTitle(activity.id, editedTitle);
    }
    setIsEditingTime(false);
  };

  const handleCancelEdit = () => {
    setEditedTime(activity.time);
    setEditedTitle(activity.title);
    setIsEditingTime(false);
  };

  return (
    <div
      className={cn(
        'group flex items-center gap-4 p-4 rounded-lg border-l-4 transition-all duration-200 animate-fade-in',
        statusBorderColors[activity.status],
        statusBgColors[activity.status],
        'hover:shadow-soft'
      )}
    >
      {/* Time */}
      <div className="min-w-[80px]">
        {isEditingTime ? (
          <input
            type="time"
            value={editedTime}
            onChange={(e) => setEditedTime(e.target.value)}
            className="w-full px-2 py-1 text-sm font-semibold rounded border border-input bg-card focus:outline-none focus:ring-2 focus:ring-ring"
          />
        ) : (
          <span className="text-sm font-semibold text-primary">{activity.time}</span>
        )}
      </div>

      {/* Title */}
      <div className="flex-1 min-w-0">
        {isEditingTime ? (
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="w-full px-2 py-1 text-sm font-medium rounded border border-input bg-card focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Task title"
          />
        ) : (
          <p className={cn(
            'text-sm font-medium leading-relaxed',
            activity.status === 'cancelled' && 'line-through text-muted-foreground'
          )}>
            {activity.title}
          </p>
        )}
      </div>

      {/* Status Badge */}
      <StatusBadge status={activity.status} />

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {isEditingTime ? (
          <>
            <button
              onClick={handleSaveTime}
              className="p-1.5 rounded-full bg-success-light text-success hover:bg-success hover:text-success-foreground transition-colors"
              title="Save"
            >
              <Check size={16} />
            </button>
            <button
              onClick={handleCancelEdit}
              className="p-1.5 rounded-full bg-muted text-muted-foreground hover:bg-destructive-light hover:text-destructive transition-colors"
              title="Cancel"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <>
            {activity.status !== 'done' && (
              <button
                onClick={() => onUpdateStatus(activity.id, 'done')}
                className="p-1.5 rounded-full bg-success-light text-success hover:bg-success hover:text-success-foreground transition-colors"
                title="Mark Done"
              >
                <Check size={16} />
              </button>
            )}
            {activity.status !== 'in progress' && activity.status !== 'cancelled' && (
              <button
                onClick={() => onUpdateStatus(activity.id, 'in progress')}
                className="p-1.5 rounded-full bg-in-progress-light text-in-progress hover:bg-in-progress hover:text-in-progress-foreground transition-colors"
                title="Mark In Progress"
              >
                <Clock size={16} />
              </button>
            )}
            {activity.status !== 'cancelled' && activity.status !== 'done' && (
              <button
                onClick={() => onUpdateStatus(activity.id, 'cancelled')}
                className="p-1.5 rounded-full bg-destructive-light text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                title="Mark Cancelled"
              >
                <X size={16} />
              </button>
            )}
            <button
              onClick={() => setIsEditingTime(true)}
              className="p-1.5 rounded-full bg-muted text-muted-foreground hover:bg-primary-light hover:text-primary transition-colors"
              title="Edit Time"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => onDelete(activity.id)}
              className="p-1.5 rounded-full bg-destructive-light text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
