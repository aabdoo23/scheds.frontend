import type { RoomAvailability } from '@/types/room';

export function timeToMinutes(time: string): number {
  const parts = time.split(':').map(Number);
  return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
}

export function formatTime(time: string | undefined | null): string {
  if (!time || typeof time !== 'string') return '--';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours ?? '0', 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes ?? '00'} ${ampm}`;
}

export type RoomStatus = 'Available Now' | 'Busy Now' | 'Free Soon';

export function getRoomStatus(room: RoomAvailability): RoomStatus {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const isFreeNow = room.freePeriods.some((period) => {
    const start = timeToMinutes(period.startTime);
    const end = timeToMinutes(period.endTime);
    return currentMinutes >= start && currentMinutes <= end;
  });

  if (isFreeNow) return 'Available Now';

  const freeSoon = room.freePeriods.some((period) => {
    const start = timeToMinutes(period.startTime);
    return start > currentMinutes && start <= currentMinutes + 30;
  });

  if (freeSoon) return 'Free Soon';

  return 'Busy Now';
}
