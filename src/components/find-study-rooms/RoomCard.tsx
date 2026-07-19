import type { RoomAvailability } from '@/types/room';
import { getRoomStatus, timeToMinutes, formatTime } from '@/lib/roomUtils';
import type { RoomStatus } from '@/lib/roomUtils';

interface RoomCardProps {
  room: RoomAvailability;
  showTimeline: boolean;
  showBusyPeriods: boolean;
}

const STATUS_CLASSES: Record<RoomStatus, string> = {
  'Available Now': 'bg-[var(--success)] text-[#1a1a1a]',
  'Busy Now': 'bg-[var(--btn-danger)] text-white',
  'Free Soon': 'bg-[var(--card-yellow)] text-[#1a1a1a]',
};

// Diagonal hatch marks busy blocks so free/busy is distinguishable without color.
const BUSY_HATCH =
  'repeating-linear-gradient(45deg, rgba(0,0,0,0.28) 0, rgba(0,0,0,0.28) 3px, transparent 3px, transparent 7px)';

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
    <div className="bg-[var(--lighter-dark)] p-5 rounded-xl border border-white/10 shadow-[0_3px_10px_rgba(0,0,0,0.2)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_5px_20px_rgba(0,0,0,0.3)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="flex justify-between items-center gap-3 mb-4">
        <div className="text-lg font-semibold text-[var(--light-text)] flex items-center gap-2 min-w-0">
          <i className="fas fa-door-open text-[var(--dark-text)]" aria-hidden />
          <span className="truncate">{room.roomNumber}</span>
        </div>
        <div className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${statusClass}`}>
          {status}
        </div>
      </div>

      <div className="my-4 flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2.5 text-[var(--light-text)]">
          <i className="fas fa-building w-5 text-center text-[var(--dark-text)]" aria-hidden />
          <span>
            Building {room.building}, Floor {room.floor}
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-[var(--light-text)]">
          <i className="fas fa-hourglass-half w-5 text-center text-[var(--dark-text)]" aria-hidden />
          <span>
            <strong>{room.continuousMinutesAvailable} minutes</strong> max continuous availability
          </span>
        </div>
        {room.availableFrom && room.availableUntil && (
          <div className="flex items-center gap-2.5 text-[var(--light-text)]">
            <i className="fas fa-check-circle w-5 text-center text-[var(--success)]" aria-hidden />
            <span>
              Best time: {formatTime(room.availableFrom)} - {formatTime(room.availableUntil)}
            </span>
          </div>
        )}
      </div>

      {showTimeline && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 mb-2">
            <span className="text-xs text-[var(--dark-text)]">Day schedule (8 AM – 10 PM)</span>
            <span className="flex items-center gap-3 text-xs text-[var(--dark-text)]" aria-hidden>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[var(--success)]" />
                Free
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-sm bg-[var(--btn-danger)]"
                  style={{ backgroundImage: BUSY_HATCH }}
                />
                Busy
              </span>
            </span>
          </div>
          <div
            role="img"
            aria-label={
              room.freePeriods.length > 0
                ? `Free: ${room.freePeriods
                    .map((p) => `${formatTime(p.startTime)} to ${formatTime(p.endTime)}`)
                    .join(', ')}. Busy times are hatched.`
                : 'No free periods this day.'
            }
            className="h-[30px] bg-[var(--dark)] rounded-md relative overflow-hidden"
          >
            {createTimelineBlocks(room).map((block, i) => (
              <div
                key={i}
                aria-hidden
                className={`absolute h-full top-0 ${
                  block.type === 'free' ? 'bg-[var(--success)]' : 'bg-[var(--btn-danger)]'
                }`}
                style={{
                  left: `${block.left}%`,
                  width: `${block.width}%`,
                  ...(block.type === 'busy' ? { backgroundImage: BUSY_HATCH } : {}),
                }}
                title={block.title}
              />
            ))}
          </div>
        </div>
      )}

      {showBusyPeriods && room.busyPeriods.length > 0 && (
        <div className="mt-3">
          <div className="text-xs text-[var(--dark-text)] mb-2">Occupied times</div>
          <div className="flex flex-col gap-1">
            {room.busyPeriods.map((p, i) => (
              <div key={i} className="text-xs text-[var(--dark-text)] flex items-center gap-2">
                <i className="fas fa-clock w-4 text-center" aria-hidden />
                <span className="text-[var(--light-text)]">
                  {formatTime(p.startTime)} - {formatTime(p.endTime)}
                </span>
                <span>({p.courseCode})</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
