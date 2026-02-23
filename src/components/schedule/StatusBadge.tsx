import { ActivityStatus } from '@/types/schedule';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: ActivityStatus;
  className?: string;
}

const statusConfig = {
  'done': {
    label: 'Done',
    className: 'bg-success text-success-foreground',
  },
  'in progress': {
    label: 'In Progress',
    className: 'bg-in-progress text-in-progress-foreground',
  },
  'upcoming': {
    label: 'Upcoming',
    className: 'bg-upcoming text-upcoming-foreground',
  },
  'cancelled': {
    label: 'Cancelled',
    className: 'bg-destructive text-destructive-foreground',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center px-3 py-1 text-xs font-semibold rounded-full min-w-[80px] transition-colors',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
