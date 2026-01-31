import type { RoomAvailability } from '@/types/room';
import { getRoomStatus, timeToMinutes, formatTime } from '@/lib/roomUtils';
import type { RoomStatus } from '@/lib/roomUtils';

interface RoomCardProps {
  room: RoomAvailability;
  showTimeline: boolean;
  showBusyPeriods: boolean;
}

const STATUS_CLASSES: Record<RoomStatus, string> = {
  'Available Now': 'bg-[#28a745] text-white',
  'Busy Now': 'bg-[#dc3545] text-white',
  'Free Soon': 'bg-[#ffc107] text-[#333]',
};

function createTimelineBlocks(room: RoomAvailability) {
  const dayStart = 8 * 60;
  const dayEnd = 22 * 60;
  const totalMinutes = dayEnd - dayStart;

  const blocks: { left: number; width: number; type: 'free' | 'busy'; title: string }[] = [];

  room.busyPeriods.forEach((period) => {
    const startMinutes = timeToMinutes(period.startTime);
    const endMinutes = timeToMinutes(period.endTime);
    const left = ((startMinutes - dayStart) / totalMinutes) * 100;
    const width = ((endMinutes - startMinutes) / totalMinutes) * 100;
    blocks.push({
      left,
      width,
      type: 'busy',
      title: `${period.courseCode} (${formatTime(period.startTime)} - ${formatTime(period.endTime)})`,
    });
  });

  room.freePeriods.forEach((period) => {
    const startMinutes = timeToMinutes(period.startTime);
    const endMinutes = timeToMinutes(period.endTime);
    const left = ((startMinutes - dayStart) / totalMinutes) * 100;
    const width = ((endMinutes - startMinutes) / totalMinutes) * 100;
    blocks.push({
      left,
      width,
      type: 'free',
      title: `Free (${formatTime(period.startTime)} - ${formatTime(period.endTime)})`,
    });
  });

  return blocks;
}

export function RoomCard({ room, showTimeline, showBusyPeriods }: RoomCardProps) {
  const status = getRoomStatus(room);
  const statusClass = STATUS_CLASSES[status];

  return (
    <div className="bg-[var(--lighter-dark)] p-5 rounded-[10px] shadow-[0_3px_10px_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_5px_20px_rgba(0,0,0,0.3)]">
      <div className="flex justify-between items-center mb-4">
        <div className="text-2xl font-bold text-[var(--light-text)]">
          <i className="fas fa-door-open mr-2" />
          {room.roomNumber}
        </div>
        <div className={`px-3 py-1 rounded-[20px] text-[0.85rem] font-semibold ${statusClass}`}>
          {status}
        </div>
      </div>
      <div className="my-4 space-y-2">
        <div className="flex items-center gap-2.5 text-[var(--light-text)]">
          <i className="fas fa-building w-5 text-[var(--dark-blue)]" />
          <span>
            Building {room.building}, Floor {room.floor}
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-[var(--light-text)]">
          <i className="fas fa-hourglass-half w-5 text-[var(--dark-blue)]" />
          <span>
            <strong>{room.continuousMinutesAvailable} minutes</strong> max continuous availability
          </span>
        </div>
        {room.availableFrom && room.availableUntil && (
          <div className="flex items-center gap-2.5 text-[var(--light-text)]">
            <i className="fas fa-check-circle w-5 text-[var(--dark-blue)]" />
            <span>
              Best time: {formatTime(room.availableFrom)} - {formatTime(room.availableUntil)}
            </span>
          </div>
        )}
      </div>
      {showTimeline && (
        <div className="mt-4 pt-4 border-t border-[var(--lightest-dark)]">
          <div className="text-[0.85rem] text-[var(--light-text)] opacity-80 mb-2">
            Today&apos;s Schedule (8 AM - 10 PM)
          </div>
          <div className="h-[30px] bg-[var(--dark)] rounded-[5px] relative overflow-hidden">
            {createTimelineBlocks(room).map((block, i) => (
              <div
                key={i}
                className={`absolute h-full top-0 flex items-center justify-center text-[0.75rem] font-semibold transition-opacity duration-300 hover:opacity-80 cursor-pointer ${
                  block.type === 'free' ? 'bg-[#28a745] text-white' : 'bg-[#dc3545] text-white'
                }`}
                style={{ left: `${block.left}%`, width: `${block.width}%` }}
                title={block.title}
              />
            ))}
          </div>
        </div>
      )}
      {showBusyPeriods && room.busyPeriods.length > 0 && (
        <div className="mt-2.5">
          <div className="text-[0.85rem] text-[var(--light-text)] opacity-80 mb-2">
            Occupied Times:
          </div>
          <div className="space-y-1">
            {room.busyPeriods.map((p, i) => (
              <div
                key={i}
                className="text-[0.85rem] text-[var(--light-text)] opacity-70 flex items-center gap-2"
              >
                <i className="fas fa-clock w-4" />
                {formatTime(p.startTime)} - {formatTime(p.endTime)}
                <span className="opacity-60">({p.courseCode})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
