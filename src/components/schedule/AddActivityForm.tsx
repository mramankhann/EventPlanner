import { useState } from 'react';
import { Check, X } from 'lucide-react';

interface AddActivityFormProps {
  onAdd: (time: string, title: string) => void;
  onCancel: () => void;
}

export function AddActivityForm({ onAdd, onCancel }: AddActivityFormProps) {
  const [time, setTime] = useState('');
  const [title, setTitle] = useState('');

  const handleSubmit = () => {
    if (time && title.trim()) {
      onAdd(time, title.trim());
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border-l-4 border-l-upcoming bg-upcoming-light animate-slide-down">
      <div className="min-w-[80px]">
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full px-2 py-1 text-sm font-semibold rounded border border-input bg-card focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Time"
          autoFocus
        />
      </div>

      <div className="flex-1">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-1.5 text-sm rounded border border-input bg-card focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Activity title..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
            if (e.key === 'Escape') onCancel();
          }}
        />
      </div>

      <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full min-w-[80px] bg-upcoming text-upcoming-foreground">
        Upcoming
      </span>

      <div className="flex items-center gap-1">
        <button
          onClick={handleSubmit}
          disabled={!time || !title.trim()}
          className="p-1.5 rounded-full bg-success-light text-success hover:bg-success hover:text-success-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Save"
        >
          <Check size={16} />
        </button>
        <button
          onClick={onCancel}
          className="p-1.5 rounded-full bg-muted text-muted-foreground hover:bg-destructive-light hover:text-destructive transition-colors"
          title="Cancel"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
