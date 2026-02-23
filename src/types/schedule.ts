export type ActivityStatus = 'done' | 'in progress' | 'upcoming' | 'cancelled';

export interface Activity {
  id: string;
  time: string;
  title: string;
  status: ActivityStatus;
}

export interface DaySchedule {
  date: string;
  companyName?: string;
  activities: Activity[];
}
