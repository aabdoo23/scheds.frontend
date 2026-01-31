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
    <div className="mb-8">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="w-full bg-[var(--lighter-dark)] px-5 py-4 rounded-t-[10px] flex justify-between items-center cursor-pointer transition-colors duration-300 hover:bg-[var(--lightest-dark)] text-left"
      >
        <div className="text-xl font-bold text-[var(--light-text)]">
          <i className="fas fa-building mr-2" />
          Building {building}
        </div>
        <div className="bg-[var(--dark-blue)] px-4 py-1 rounded-[20px] text-[0.9rem] text-white">
          {rooms.length} rooms
        </div>
      </button>
      {!collapsed && (
        <div className="grid gap-5 p-5 bg-[var(--dark)] rounded-b-[10px] grid-cols-[repeat(auto-fill,minmax(350px,1fr))]">
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
