import { useState } from 'react';
import type { RoomAvailability } from '@/types/room';
import { RoomCard } from './RoomCard';

interface BuildingGroupProps {
  building: string;
  rooms: RoomAvailability[];
  showTimeline: boolean;
  showBusyPeriods: boolean;
}

export function BuildingGroup({
  building,
  rooms,
  showTimeline,
  showBusyPeriods,
}: BuildingGroupProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="rounded-xl border border-white/10 overflow-hidden">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
        className="w-full bg-[var(--lighter-dark)] px-5 py-4 flex justify-between items-center gap-3 cursor-pointer transition-colors hover:bg-white/5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-blue)] focus-visible:ring-inset"
      >
        <div className="text-lg font-semibold text-[var(--light-text)] flex items-center gap-2 min-w-0">
          <i className="fas fa-building text-[var(--dark-text)]" aria-hidden />
          <span className="truncate">Building {building}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="bg-white/10 px-3 py-0.5 rounded-full text-xs text-[var(--dark-text)] tabular-nums">
            {rooms.length} rooms
          </span>
          <i
            className={`fas fa-chevron-down text-[var(--dark-text)] transition-transform ${
              collapsed ? '' : 'rotate-180'
            }`}
            aria-hidden
          />
        </div>
      </button>
      {!collapsed && (
        <div className="grid gap-5 p-4 sm:p-5 grid-cols-[repeat(auto-fill,minmax(320px,1fr))]">
          {rooms.map((room) => (
            <RoomCard
              key={room.roomNumber}
              room={room}
              showTimeline={showTimeline}
              showBusyPeriods={showBusyPeriods}
            />
          ))}
        </div>
      )}
    </div>
  );
}
