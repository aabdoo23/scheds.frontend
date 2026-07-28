import { useCallback, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWatchedSections } from '@/hooks/useWatchedSections';
import { useTitleBadge } from '@/hooks/useTitleBadge';
import { useCourseSearchDebounced } from '@/hooks/useCourseSearchDebounced';
import { useCourseSections } from '@/hooks/useCourseSections';
import { sectionKey, type CourseSearchItem } from '@/types/seatAlerts';
import { AuthOverlay } from '@/components/seat-alerts/AuthOverlay';
import { AddSectionForm } from '@/components/seat-alerts/AddSectionForm';
import { WatchStatus } from '@/components/seat-alerts/WatchStatus';
import { WatchList } from '@/components/seat-alerts/WatchList';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export function SeatAlertsPage() {
  const { isAuthenticated, email } = useAuth();
  const {
    sections: watched,
    loading,
    refreshing,
    error,
    lastRefreshed,
    pendingKeys,
    openedKeys,
    refreshSeats,
    add,
    remove,
    removeAll,
    dismissOpened,
  } = useWatchedSections(isAuthenticated);

  const [searchQuery, setSearchQuery] = useState('');
  const { results: searchResults, loading: searchLoading } = useCourseSearchDebounced(searchQuery, 500);
  const { sections, loading: sectionsLoading, fetchSections } = useCourseSections();
  const [selectedCourse, setSelectedCourse] = useState<CourseSearchItem | null>(null);
  const [selectedSection, setSelectedSection] = useState('');
  const [stopAllOpen, setStopAllOpen] = useState(false);
  const [stopTarget, setStopTarget] = useState<{ courseCode: string; section: string } | null>(null);

  useTitleBadge(openedKeys.length);

  const watchedKeys = useMemo(
    () => new Set(watched.map((s) => sectionKey(s.courseCode, s.section))),
    [watched]
  );

  const pendingAddKey =
    selectedCourse && selectedSection
      ? sectionKey(selectedCourse.courseCode, selectedSection)
      : null;
  const adding = pendingAddKey !== null && pendingKeys.includes(pendingAddKey);
  const alreadyWatching = pendingAddKey !== null && watchedKeys.has(pendingAddKey);

  const handleSelectCourse = useCallback(
    (course: CourseSearchItem) => {
      setSelectedCourse(course);
      setSelectedSection('');
      setSearchQuery('');
      fetchSections(course.courseCode);
    },
    [fetchSections]
  );

  const handleClearCourse = useCallback(() => {
    setSelectedCourse(null);
    setSelectedSection('');
  }, []);

  const handleAdd = useCallback(async () => {
    if (!selectedCourse || !selectedSection) return;
    const ok = await add(selectedCourse.courseCode.toUpperCase(), selectedSection);
    if (ok) handleClearCourse();
  }, [selectedCourse, selectedSection, add, handleClearCourse]);

  const handleStopConfirm = useCallback(async () => {
    if (!stopTarget) return;
    const { courseCode, section } = stopTarget;
    setStopTarget(null);
    await remove(courseCode, section);
  }, [stopTarget, remove]);

  const handleStopAllConfirm = useCallback(async () => {
    setStopAllOpen(false);
    await removeAll();
  }, [removeAll]);

  return (
    <>
      {!isAuthenticated && <AuthOverlay />}

      <ConfirmDialog
        open={stopTarget !== null}
        title="Stop watching?"
        message={
          stopTarget
            ? `Stop watching ${stopTarget.courseCode} Section ${stopTarget.section}? You will no longer be emailed when a seat opens.`
            : ''
        }
        confirmLabel="Stop watching"
        onConfirm={handleStopConfirm}
        onCancel={() => setStopTarget(null)}
      />
      <ConfirmDialog
        open={stopAllOpen}
        title="Stop all alerts?"
        message="Stop watching every section? You will no longer be emailed about any of them."
        confirmLabel="Stop all"
        onConfirm={handleStopAllConfirm}
        onCancel={() => setStopAllOpen(false)}
      />

      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 text-[var(--light-text)]">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight m-0 mb-1">Seat alerts</h1>
        <p className="text-[var(--dark-text)] m-0 mb-8 max-w-[70ch]">
          Pick the sections you need. Scheds checks them against live NU data and emails you the
          moment a seat opens — even when this tab is closed.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] gap-x-8 gap-y-10 items-start">
          <section aria-labelledby="add-heading">
            <div className="mb-4">
              <h2 id="add-heading" className="text-[var(--light-text)] text-xl font-semibold m-0">
                Add a section
              </h2>
              <p className="text-[var(--dark-text)] text-sm m-0 mt-1">
                Search a course, then choose the section you want.
              </p>
            </div>
            <AddSectionForm
              query={searchQuery}
              onQueryChange={setSearchQuery}
              results={searchResults}
              loading={searchLoading}
              onSelectCourse={handleSelectCourse}
              selectedCourse={selectedCourse}
              onClearCourse={handleClearCourse}
              sections={sections}
              sectionsLoading={sectionsLoading}
              selectedSection={selectedSection}
              onSectionChange={setSelectedSection}
              onAdd={handleAdd}
              disabled={!isAuthenticated}
              adding={adding}
              alreadyWatching={alreadyWatching}
            />
          </section>

          <section aria-labelledby="watching-heading">
            <span id="watching-heading" className="sr-only">
              Watched sections
            </span>
            <WatchStatus
              count={watched.length}
              email={email}
              refreshing={refreshing}
              lastRefreshed={lastRefreshed}
              error={error}
              openedCount={openedKeys.length}
              onRefresh={refreshSeats}
              onStopAll={() => setStopAllOpen(true)}
              onDismissOpened={dismissOpened}
            />
            <WatchList
              sections={watched}
              pendingKeys={pendingKeys}
              openedKeys={openedKeys}
              loading={loading}
              onRemove={(courseCode, section) => setStopTarget({ courseCode, section })}
            />
          </section>
        </div>
      </main>
    </>
  );
}
