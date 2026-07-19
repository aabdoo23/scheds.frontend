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

  const hasResults = !loading && !error && filteredRooms.length > 0;

  return (
    <main className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 text-[var(--light-text)]">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight m-0 mb-1">Find study rooms</h1>
      <p className="text-[var(--dark-text)] m-0 mb-8">
        Find an open study space by day, time, and how long you need it.
      </p>

      <div className="grid gap-5 lg:grid-cols-2 xl:items-start mb-8">
        <SearchSection
          dayOfWeek={dayOfWeek}
          onDayChange={setDayOfWeek}
          minimumMinutes={minimumMinutes}
          onMinimumMinutesChange={setMinimumMinutes}
          onlyAvailableNow={filters.onlyAvailableNow}
          onOnlyAvailableNowChange={(v) => setFilters((f) => ({ ...f, onlyAvailableNow: v }))}
          onSearchNow={handleSearchNow}
          onSearchSelectedDay={handleSearchSelectedDay}
        />
        <FiltersSection filters={filters} onFiltersChange={setFilters} />
      </div>

      <section aria-label="Available rooms" aria-live="polite">
        {hasResults && (
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 mb-4">
            <h2 className="text-[var(--light-text)] text-xl font-semibold m-0">Available rooms</h2>
          </div>
        )}

        {stats && (
          <StatsCards
            totalRooms={stats.totalRooms}
            availableNow={stats.availableNow}
            avgAvailability={stats.avgAvailability}
          />
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl bg-[var(--lighter-dark)] border border-white/10 text-center">
            <i className="fas fa-circle-notch fa-spin text-4xl text-[var(--light-blue)] mb-4" aria-hidden />
            <h3 className="text-[var(--light-text)] text-xl font-semibold m-0 mb-2">
              Searching for rooms&hellip;
            </h3>
            <p className="text-[var(--dark-text)] m-0 max-w-md">
              Checking availability across every building for your day and time.
            </p>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="flex flex-col items-center justify-center py-12 px-4 rounded-xl bg-[var(--lighter-dark)] border border-[var(--btn-danger)]/40 text-center"
          >
            <i className="fas fa-triangle-exclamation text-4xl text-[var(--btn-danger)] mb-4" aria-hidden />
            <h3 className="text-[var(--light-text)] text-xl font-semibold m-0 mb-2">
              Couldn&apos;t load room data
            </h3>
            <p className="text-[var(--light-text)]/80 m-0 max-w-md">{error}</p>
          </div>
        )}

        {!loading && !error && filteredRooms.length === 0 && data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl bg-[var(--lighter-dark)] border border-white/10 text-center">
            <i className="fas fa-door-closed text-4xl text-[var(--dark-text)] mb-4" aria-hidden />
            <h3 className="text-[var(--light-text)] text-xl font-semibold m-0 mb-2">No rooms yet</h3>
            <p className="text-[var(--dark-text)] m-0 max-w-md">
              Pick a day and duration above, then run a search to see open rooms here.
            </p>
          </div>
        )}

        {!loading && !error && filteredRooms.length === 0 && data.length > 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl bg-[var(--lighter-dark)] border border-white/10 text-center">
            <i className="fas fa-door-closed text-4xl text-[var(--dark-text)] mb-4" aria-hidden />
            <h3 className="text-[var(--light-text)] text-xl font-semibold m-0 mb-2">
              None available right now
            </h3>
            <p className="text-[var(--dark-text)] m-0 max-w-md">
              No rooms are open at this moment. Turn off &ldquo;Only available now&rdquo; to see the
              full day.
            </p>
          </div>
        )}

        {hasResults && filters.groupByBuilding && (
          <div className="flex flex-col gap-6">
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

        {hasResults && !filters.groupByBuilding && (
          <div className="grid gap-5 grid-cols-[repeat(auto-fill,minmax(320px,1fr))]">
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
      </section>
    </main>
  );
}
