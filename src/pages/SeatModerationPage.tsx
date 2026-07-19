import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSeatModerationCart } from '@/hooks/useSeatModerationCart';
import { useCourseSearchDebounced } from '@/hooks/useCourseSearchDebounced';
import { useCourseSections } from '@/hooks/useCourseSections';
import { useSeatMonitoring } from '@/hooks/useSeatMonitoring';
import type { CourseSearchItem } from '@/types/seatModeration';
import { AuthOverlay } from '@/components/seat-moderation/AuthOverlay';
import { CourseSearch } from '@/components/seat-moderation/CourseSearch';
import { CartList } from '@/components/seat-moderation/CartList';
import { MonitoringControls } from '@/components/seat-moderation/MonitoringControls';
import { ResultsPanel } from '@/components/seat-moderation/ResultsPanel';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export function SeatModerationPage() {
  const { isAuthenticated } = useAuth();
  const { cart, loading: cartLoading, actionLoading, fetchCart, addToCart, removeFromCart, clearCart } =
    useSeatModerationCart();
  const [searchQuery, setSearchQuery] = useState('');
  const { results: searchResults, loading: searchLoading } =
    useCourseSearchDebounced(searchQuery, 500);
  const { sections, loading: sectionsLoading, fetchSections } = useCourseSections();
  const [selectedCourse, setSelectedCourse] = useState<CourseSearchItem | null>(null);
  const [selectedSection, setSelectedSection] = useState('');
  const {
    results,
    statusText,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    checkSeats,
  } = useSeatMonitoring(cart, isAuthenticated);
  const [hasStopped, setHasStopped] = useState(false);
  const [clearCartOpen, setClearCartOpen] = useState(false);
  const [unsubscribeTarget, setUnsubscribeTarget] = useState<{ courseCode: string; section: string } | null>(null);

  const handleStop = useCallback(() => {
    setHasStopped(true);
    stopMonitoring();
  }, [stopMonitoring]);

  const handleStart = useCallback(() => {
    setHasStopped(false);
    startMonitoring();
  }, [startMonitoring]);

  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated, fetchCart]);

  const handleSelectCourse = useCallback(
    (course: CourseSearchItem) => {
      setSelectedCourse(course);
      setSelectedSection('');
      setSearchQuery('');
      fetchSections(course.courseCode);
    },
    [fetchSections]
  );

  const handleAddToCart = useCallback(async () => {
    if (!selectedCourse || !selectedSection || !isAuthenticated) return;
    const courseCode = selectedCourse.courseCode.toUpperCase();
    if (cart.some((c) => c.courseCode === courseCode && c.section === selectedSection)) {
      return;
    }
    const ok = await addToCart(courseCode, selectedSection);
    if (ok) {
      setSelectedCourse(null);
      setSelectedSection('');
      if (isMonitoring) checkSeats();
    }
  }, [selectedCourse, selectedSection, isAuthenticated, cart, addToCart, isMonitoring, checkSeats]);

  const handleRemoveFromCart = useCallback(
    async (courseCode: string, section: string) => {
      const ok = await removeFromCart(courseCode, section);
      if (ok && isMonitoring) checkSeats();
    },
    [removeFromCart, isMonitoring, checkSeats]
  );

  const handleClearCartClick = useCallback(() => {
    setClearCartOpen(true);
  }, []);

  const handleClearCartConfirm = useCallback(async () => {
    setClearCartOpen(false);
    const ok = await clearCart();
    if (ok && isMonitoring) {
      setHasStopped(true);
      stopMonitoring();
    }
  }, [clearCart, isMonitoring, stopMonitoring]);

  const handleUnsubscribeClick = useCallback((courseCode: string, section: string) => {
    setUnsubscribeTarget({ courseCode, section });
  }, []);

  const handleUnsubscribeConfirm = useCallback(async () => {
    if (!unsubscribeTarget) return;
    const { courseCode, section } = unsubscribeTarget;
    setUnsubscribeTarget(null);
    const ok = await removeFromCart(courseCode, section);
    if (ok && isMonitoring) checkSeats();
  }, [unsubscribeTarget, removeFromCart, isMonitoring, checkSeats]);

  return (
    <>
      {!isAuthenticated && <AuthOverlay />}
      <ConfirmDialog
        open={clearCartOpen}
        title="Clear All"
        message="Clear all courses from cart?"
        confirmLabel="Clear All"
        onConfirm={handleClearCartConfirm}
        onCancel={() => setClearCartOpen(false)}
      />
      <ConfirmDialog
        open={unsubscribeTarget !== null}
        title="Stop Monitoring"
        message={
          unsubscribeTarget
            ? `Stop monitoring ${unsubscribeTarget.courseCode} Section ${unsubscribeTarget.section}?`
            : ''
        }
        confirmLabel="Stop Monitoring"
        onConfirm={handleUnsubscribeConfirm}
        onCancel={() => setUnsubscribeTarget(null)}
      />
      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 text-[var(--light-text)]">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight m-0 mb-1">Seat monitoring</h1>
        <p className="text-[var(--dark-text)] m-0 mb-8">
          Track course seats and get notified the moment one opens up.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xl:items-start">
          <div>
            <CourseSearch
              query={searchQuery}
              onQueryChange={setSearchQuery}
              results={searchResults}
              loading={searchLoading}
              onSelectCourse={handleSelectCourse}
              selectedCourse={selectedCourse}
              sections={sections}
              sectionsLoading={sectionsLoading}
              selectedSection={selectedSection}
              onSectionChange={setSelectedSection}
              onAddToCart={handleAddToCart}
              isAuthenticated={isAuthenticated}
              addDisabled={actionLoading}
            />
            <CartList
              cart={cart}
              onRemove={handleRemoveFromCart}
              onClearAll={handleClearCartClick}
              isAuthenticated={isAuthenticated}
              loading={cartLoading}
              actionLoading={actionLoading}
            />
          </div>

          <div>
            <MonitoringControls
              isMonitoring={isMonitoring}
              statusText={statusText}
              onStart={handleStart}
              onStop={handleStop}
              cartEmpty={cart.length === 0}
              isAuthenticated={isAuthenticated}
            />
            <ResultsPanel
              results={results}
              isMonitoring={isMonitoring}
              stopped={hasStopped}
              onUnsubscribe={handleUnsubscribeClick}
              actionLoading={actionLoading}
            />
          </div>
        </div>
      </main>
    </>
  );
}
