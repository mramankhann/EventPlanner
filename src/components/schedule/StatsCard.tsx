import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant: 'total' | 'done' | 'inProgress' | 'upcoming' | 'cancelled';
  percentage?: number;
}

const variantStyles = {
  total: {
    bg: 'bg-gradient-to-br from-primary/10 to-primary/5',
    iconBg: 'bg-primary/20',
    iconColor: 'text-primary',
    valueColor: 'text-primary',
  },
  done: {
    bg: 'bg-gradient-to-br from-success/10 to-success/5',
    iconBg: 'bg-success/20',
    iconColor: 'text-success',
    valueColor: 'text-success',
  },
  inProgress: {
    bg: 'bg-gradient-to-br from-in-progress/10 to-in-progress/5',
    iconBg: 'bg-in-progress/20',
    iconColor: 'text-in-progress',
    valueColor: 'text-in-progress',
  },
  upcoming: {
    bg: 'bg-gradient-to-br from-upcoming/10 to-upcoming/5',
    iconBg: 'bg-upcoming/20',
    iconColor: 'text-upcoming',
    valueColor: 'text-upcoming',
  },
  cancelled: {
    bg: 'bg-gradient-to-br from-destructive/10 to-destructive/5',
    iconBg: 'bg-destructive/20',
    iconColor: 'text-destructive',
    valueColor: 'text-destructive',
  },
};

export function StatsCard({ title, value, icon: Icon, variant, percentage }: StatsCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl p-5 transition-all duration-300 hover:shadow-medium hover:scale-[1.02]',
        styles.bg
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <p className={cn('text-3xl font-bold', styles.valueColor)}>{value}</p>
          {percentage !== undefined && (
            <p className="text-xs text-muted-foreground mt-1">
              {percentage}% of total
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl', styles.iconBg)}>
          <Icon className={cn('w-6 h-6', styles.iconColor)} />
        </div>
      </div>
      
      {/* Decorative element */}
      <div className={cn(
        'absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-20',
        styles.iconBg
      )} />
    </div>
  );
}
