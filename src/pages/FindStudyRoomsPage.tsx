import { useState, useMemo } from 'react';
import { useRoomAvailability } from '@/hooks/useRoomAvailability';
import { timeToMinutes } from '@/lib/roomUtils';
import type { RoomAvailability } from '@/types/room';
import { SearchSection } from '@/components/find-study-rooms/SearchSection';
import { FiltersSection, type DisplayFilters } from '@/components/find-study-rooms/FiltersSection';
import { StatsCards } from '@/components/find-study-rooms/StatsCards';
import { RoomCard } from '@/components/find-study-rooms/RoomCard';
import { BuildingGroup } from '@/components/find-study-rooms/BuildingGroup';

const DEFAULT_FILTERS: DisplayFilters = {
  showTimeline: true,
  showBusyPeriods: true,
  groupByBuilding: true,
  onlyAvailableNow: false,
};

function isAvailableNow(room: RoomAvailability): boolean {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  return room.freePeriods.some((p) => {
    const start = timeToMinutes(p.startTime);
    const end = timeToMinutes(p.endTime);
    return currentTime >= start && currentTime <= end;
  });
}

export function FindStudyRoomsPage() {
  const { data, loading, error, fetchRoomAvailability } = useRoomAvailability();
  const [dayOfWeek, setDayOfWeek] = useState('saturday');
  const [minimumMinutes, setMinimumMinutes] = useState(60);
  const [filters, setFilters] = useState<DisplayFilters>(DEFAULT_FILTERS);

  const filteredRooms = useMemo(() => {
    if (filters.onlyAvailableNow) {
      return data.filter(isAvailableNow);
    }
    return data;
  }, [data, filters.onlyAvailableNow]);

  const stats = useMemo(() => {
    if (filteredRooms.length === 0) return null;
    const availableNow = filteredRooms.filter(isAvailableNow).length;
    const avgAvailability =
      Math.round(
        filteredRooms.reduce((sum, r) => sum + r.continuousMinutesAvailable, 0) /
          filteredRooms.length
      ) || 0;
    return {
      totalRooms: filteredRooms.length,
      availableNow,
      avgAvailability,
    };
  }, [filteredRooms]);

  const handleSearchNow = () => {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const time = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}:00`;
    setDayOfWeek(currentDay);
    fetchRoomAvailability(currentDay, time, minimumMinutes);
  };

  const handleSearchSelectedDay = () => {
    fetchRoomAvailability(dayOfWeek, null, minimumMinutes);
  };

  const buildingGroups = useMemo(() => {
    const groups: Record<string, RoomAvailability[]> = {};
    for (const room of filteredRooms) {
      const building = room.building || 'Unknown';
      if (!groups[building]) groups[building] = [];
      groups[building].push(room);
    }
    return groups;
  }, [filteredRooms]);

  return (
    <div className="flex flex-col items-center p-5 min-h-screen text-[var(--light-text)]">
      <div className="text-center mt-6 mb-8">
        <h1 className="text-4xl text-[var(--light-text)] mb-2.5">
          <i className="fas fa-door-open mr-2" />
          Find Study Rooms
        </h1>
        <p className="text-lg text-[var(--light-text)] opacity-80">
          Find the perfect study space for your needs
        </p>
      </div>

      <div className="flex gap-5 w-full max-w-[1400px] mb-8 flex-wrap">
        <SearchSection
          dayOfWeek={dayOfWeek}
          onDayChange={setDayOfWeek}
          minimumMinutes={minimumMinutes}
          onMinimumMinutesChange={setMinimumMinutes}
          onSearchNow={handleSearchNow}
          onSearchSelectedDay={handleSearchSelectedDay}
        />
        <FiltersSection filters={filters} onFiltersChange={setFilters} />
      </div>

      {stats && (
        <div className="w-full max-w-[1400px]">
          <StatsCards
            totalRooms={stats.totalRooms}
            availableNow={stats.availableNow}
            avgAvailability={stats.avgAvailability}
          />
        </div>
      )}

      <div className="w-full max-w-[1400px]">
        {loading && (
          <div className="text-center py-10 text-lg text-[var(--light-text)]">
            <i className="fas fa-spinner fa-spin mr-2" />
            Searching for available rooms...
          </div>
        )}

        {error && (
          <div className="text-center py-16 bg-[var(--lighter-dark)] rounded-xl text-[var(--light-text)]">
            <i className="fas fa-exclamation-triangle text-6xl mb-5 opacity-50" />
            <h3 className="text-xl font-semibold">Error fetching room data</h3>
            <p className="mt-2">{error}</p>
          </div>
        )}

        {!loading && !error && filteredRooms.length === 0 && data.length === 0 && (
          <div className="text-center py-16 bg-[var(--lighter-dark)] rounded-xl text-[var(--light-text)]">
            <i className="fas fa-door-closed text-6xl mb-5 opacity-50" />
            <h3 className="text-xl font-semibold">No Rooms Available</h3>
            <p className="mt-2 opacity-80">
              No rooms match your search criteria. Try adjusting the filters or run a search.
            </p>
          </div>
        )}

        {!loading && !error && filteredRooms.length === 0 && data.length > 0 && (
          <div className="text-center py-16 bg-[var(--lighter-dark)] rounded-xl text-[var(--light-text)]">
            <i className="fas fa-door-closed text-6xl mb-5 opacity-50" />
            <h3 className="text-xl font-semibold">No Rooms Available Now</h3>
            <p className="mt-2 opacity-80">
              No rooms are currently available. Try unchecking &quot;Only Show Currently
              Available&quot;.
            </p>
          </div>
        )}

        {!loading && !error && filteredRooms.length > 0 && filters.groupByBuilding && (
          <div className="space-y-8">
            {Object.entries(buildingGroups).map(([building, rooms]) => (
              <BuildingGroup
                key={building}
                building={building}
                rooms={rooms}
                showTimeline={filters.showTimeline}
                showBusyPeriods={filters.showBusyPeriods}
              />
            ))}
          </div>
        )}

        {!loading && !error && filteredRooms.length > 0 && !filters.groupByBuilding && (
          <div className="grid gap-5 p-5 bg-[var(--dark)] rounded-[10px] grid-cols-[repeat(auto-fill,minmax(350px,1fr))]">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.roomNumber}
                room={room}
                showTimeline={filters.showTimeline}
                showBusyPeriods={filters.showBusyPeriods}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
