// Consistent date parsing for TIMESTAMP columns from PostgreSQL
// Normalizes SQL format (space separator) to ISO format (T separator)
// to avoid cross-browser inconsistencies with Date.parse()
export function parseDate(input: string | Date | null | undefined): Date | null {
  if (!input) return null;
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
  const normalized = typeof input === 'string' ? input.replace(' ', 'T') : input;
  const d = new Date(normalized);
  return isNaN(d.getTime()) ? null : d;
}

export type ScheduleStatus = 'upcoming' | 'active' | 'ended' | 'unscheduled';

function determineStatus(startTime: Date | null, endTime: Date | null): ScheduleStatus {
  if (!startTime || !endTime) return 'unscheduled';
  const now = Date.now();
  if (now < startTime.getTime()) return 'upcoming';
  if (now > endTime.getTime()) return 'ended';
  return 'active';
}

export function getScheduleStatus(startTime: string | Date | null | undefined, endTime?: string | Date | number | null): ScheduleStatus {
  if (!startTime) return 'unscheduled';
  const start = parseDate(startTime);
  if (!start) return 'unscheduled';

  if (endTime === undefined || endTime === null || typeof endTime === 'number') {
    const dur = endTime ?? 60;
    const end = new Date(start.getTime() + dur * 60 * 1000);
    return determineStatus(start, end);
  }

  const end = parseDate(endTime);
  return determineStatus(start, end);
}

export function isEnded(dueDate: string | Date | null | undefined, durationMinutes?: number | null): boolean {
  return getScheduleStatus(dueDate, durationMinutes) === 'ended';
}

export function isUpcoming(dueDate: string | Date | null | undefined, durationMinutes?: number | null): boolean {
  return getScheduleStatus(dueDate, durationMinutes) === 'upcoming';
}

export function getStatusLabel(status: ScheduleStatus): string;
export function getStatusLabel(dueDate: string | Date | null | undefined, durationMinutes?: number | null): string;
export function getStatusLabel(dueDateOrStatus: string | Date | ScheduleStatus | null | undefined, durationMinutes?: number | null): string {
  if (typeof dueDateOrStatus === 'string' && ['upcoming', 'active', 'ended', 'unscheduled'].includes(dueDateOrStatus)) {
    switch (dueDateOrStatus) {
      case 'upcoming': return 'Upcoming';
      case 'active': return 'Active';
      case 'ended': return 'Ended';
      case 'unscheduled': return 'Always Available';
    }
  }
  const status = getScheduleStatus(dueDateOrStatus as string | Date | null | undefined, durationMinutes);
  switch (status) {
    case 'upcoming': return 'Upcoming';
    case 'active': return 'Active';
    case 'ended': return 'Ended';
    case 'unscheduled': return 'Always Available';
  }
}

export function getStatusColor(status: ScheduleStatus): string;
export function getStatusColor(dueDate: string | Date | null | undefined, durationMinutes?: number | null): string;
export function getStatusColor(dueDateOrStatus: string | Date | ScheduleStatus | null | undefined, durationMinutes?: number | null): string {
  if (typeof dueDateOrStatus === 'string' && ['upcoming', 'active', 'ended', 'unscheduled'].includes(dueDateOrStatus)) {
    switch (dueDateOrStatus) {
      case 'upcoming': return 'text-blue-600 bg-blue-50';
      case 'active': return 'text-green-600 bg-green-50';
      case 'ended': return 'text-red-600 bg-red-50';
      case 'unscheduled': return 'text-gray-600 bg-gray-50';
    }
  }
  const status = getScheduleStatus(dueDateOrStatus as string | Date | null | undefined, durationMinutes);
  switch (status) {
    case 'upcoming': return 'text-blue-600 bg-blue-50';
    case 'active': return 'text-green-600 bg-green-50';
    case 'ended': return 'text-red-600 bg-red-50';
    case 'unscheduled': return 'text-gray-600 bg-gray-50';
  }
}
