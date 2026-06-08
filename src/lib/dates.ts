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

export function getScheduleStatus(dueDate: string | Date | null | undefined, durationMinutes?: number | null): ScheduleStatus {
  if (!dueDate) return 'unscheduled';
  const startTime = parseDate(dueDate);
  if (!startTime) return 'unscheduled';
  const dur = durationMinutes ?? 60;
  const endTime = startTime.getTime() + dur * 60 * 1000;
  const now = Date.now();
  if (now < startTime.getTime()) return 'upcoming';
  if (now > endTime) return 'ended';
  return 'active';
}

export function isEnded(dueDate: string | Date | null | undefined, durationMinutes?: number | null): boolean {
  return getScheduleStatus(dueDate, durationMinutes) === 'ended';
}

export function isUpcoming(dueDate: string | Date | null | undefined, durationMinutes?: number | null): boolean {
  return getScheduleStatus(dueDate, durationMinutes) === 'upcoming';
}

export function getStatusLabel(dueDate: string | Date | null | undefined, durationMinutes?: number | null): string {
  const status = getScheduleStatus(dueDate, durationMinutes);
  switch (status) {
    case 'upcoming': return 'Upcoming';
    case 'active': return 'Active';
    case 'ended': return 'Ended';
    case 'unscheduled': return 'Always Available';
  }
}

export function getStatusColor(dueDate: string | Date | null | undefined, durationMinutes?: number | null): string {
  const status = getScheduleStatus(dueDate, durationMinutes);
  switch (status) {
    case 'upcoming': return 'text-blue-600 bg-blue-50';
    case 'active': return 'text-green-600 bg-green-50';
    case 'ended': return 'text-red-600 bg-red-50';
    case 'unscheduled': return 'text-gray-600 bg-gray-50';
  }
}
