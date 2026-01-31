import { useState, useCallback, useEffect } from 'react';
import { fetchWithCredentials } from '@/lib/api';
import { useGenerateCart } from '@/hooks/useGenerateCart';
import { useGenerateRequest } from '@/hooks/useGenerateRequest';
import { useCourseSearchDebounced } from '@/hooks/useCourseSearchDebounced';
import type { GenerateRequest, ScheduleCardItem, CustomCartItem } from '@/types/generate';
import { SearchSection } from '@/components/generate-schedules/SearchSection';
import { CartList } from '@/components/generate-schedules/CartList';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { CustomizationForm } from '@/components/generate-schedules/CustomizationForm';
import { SchedulesList } from '@/components/generate-schedules/SchedulesList';

export function GenerateSchedulesPage() {
  const [query, setQuery] = useState('');
  const [schedules, setSchedules] = useState<ScheduleCardItem[][]>([]);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [searchLiveLoading, setSearchLiveLoading] = useState(false);
  const [cartLimitError, setCartLimitError] = useState(false);
  const [clearCartOpen, setClearCartOpen] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!addedFeedback) return;
    const t = setTimeout(() => setAddedFeedback(null), 2000);
    return () => clearTimeout(t);
  }, [addedFeedback]);

  const {
    cart,
    liveSearchLoading,
    addToCart,
    removeFromCart,
    clearCart,
    hasCustomSelection,
  } = useGenerateCart();

  const { request, updateRequest } = useGenerateRequest();
  const { results, loading: searchLoading } = useCourseSearchDebounced(query);

  const handleAddToCart = useCallback(
    (item: CustomCartItem) => {
      setCartLimitError(false);
      const existing = cart.find((c) => c.courseCode === item.courseCode);
      if (existing) {
        addToCart(item, request.useLiveData);
        setAddedFeedback(item.courseCode);
        return;
      }
      if (cart.length >= 8) {
        setCartLimitError(true);
        return;
      }
      addToCart(item, request.useLiveData);
      setAddedFeedback(item.courseCode);
    },
    [cart, addToCart, request.useLiveData]
  );

  const handleSearchLive = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearchLiveLoading(true);
    try {
      await fetchWithCredentials(
        `/api/coursebase/search/${encodeURIComponent(trimmed)}`
      );
    } catch {
      // ignore
    } finally {
      setSearchLiveLoading(false);
    }
  }, [query]);

  const handleUpdateCartItem = useCallback(
    (item: CustomCartItem) => {
      addToCart(item, false);
    },
    [addToCart]
  );

  const handleClearCartClick = useCallback(() => {
    setClearCartOpen(true);
  }, []);

  const handleClearCartConfirm = useCallback(() => {
    setClearCartOpen(false);
    clearCart();
  }, [clearCart]);

  const buildGenerateRequest = useCallback((): GenerateRequest => {
    const selectedItems = cart
      .filter((c) => !hasCustomSelection(c))
      .map((c) => ({ courseCode: c.courseCode, courseName: c.courseName }));
    const customSelectedItems = cart.filter(hasCustomSelection).map((c) => ({
      courseCode: c.courseCode,
      courseName: c.courseName,
      excludedMainSections: c.excludedMainSections?.filter(Boolean),
      excludedSubSections: c.excludedSubSections?.filter(Boolean),
      excludedProfessors: c.excludedProfessors?.filter(Boolean),
      excludedTAs: c.excludedTAs?.filter(Boolean),
    }));

    const isNumberOfDaysSelected = request.isNumberOfDaysSelected;
    const selectedDays = isNumberOfDaysSelected
      ? [...Array(request.numberOfDays).fill(true), ...Array(6 - request.numberOfDays).fill(false)]
      : request.selectedDays;

    return {
      ...request,
      selectedItems,
      customSelectedItems,
      selectedDays,
    };
  }, [cart, request, hasCustomSelection]);

  const handleGenerate = useCallback(async () => {
    const genRequest = buildGenerateRequest();

    setGenerateLoading(true);
    try {
      const res = await fetchWithCredentials('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(genRequest),
      });

      if (!res.ok) {
        setSchedules([]);
        return;
      }

      const json = await res.json();
      const data = Array.isArray(json) ? json : [];
      setSchedules(data);
    } catch {
      setSchedules([]);
    } finally {
      setGenerateLoading(false);
    }
  }, [buildGenerateRequest]);

  return (
    <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {addedFeedback && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-[var(--light-blue)] text-white font-medium flex items-center gap-2 shadow-lg"
        >
          <i className="fas fa-check" aria-hidden />
          {addedFeedback} added to cart
        </div>
      )}

      {/* Search and Cart */}
      <section className="flex flex-col lg:flex-row gap-5 mb-8" aria-label="Search and cart">
        <SearchSection
          query={query}
          onQueryChange={setQuery}
          results={results}
          loading={searchLoading}
          liveSearchLoading={liveSearchLoading || searchLiveLoading}
          useLiveData={request.useLiveData}
          onUseLiveDataChange={(v) => updateRequest({ useLiveData: v })}
          onAddToCart={handleAddToCart}
          onSearchLive={handleSearchLive}
          cartLimitError={cartLimitError}
          onCartLimitErrorDismiss={() => setCartLimitError(false)}
        />
        <CartList
          cart={cart}
          onRemove={removeFromCart}
          onClear={handleClearCartClick}
          onUpdate={handleUpdateCartItem}
          hasCustomSelection={hasCustomSelection}
        />
      </section>

      {/* Customization */}
      <CustomizationForm request={request} onUpdate={updateRequest} />

      {/* Generate button */}
      <div className="sticky bottom-0 z-10 pt-4 pb-4 lg:pt-0 lg:pb-0 lg:static lg:z-auto bg-[var(--dark)] lg:bg-transparent -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
        <Button
        onClick={handleGenerate}
        disabled={generateLoading || cart.length === 0}
        aria-busy={generateLoading}
        fullWidth
        className="py-4 text-xl"
      >
        Generate Schedules
      </Button>
      </div>
      {generateLoading && (
        <h3 className="text-center text-[var(--light-text)] mt-4" aria-live="polite">
          Working the magic, please wait...
          <br />
          Don&apos;t panic it&apos;s not stuck, it&apos;s just amazed by your choices.
        </h3>
      )}

      {/* Generated Schedules */}
      <section className="mt-10" role="region" aria-label="Generated schedules" aria-live="polite">
        <div className="flex flex-row items-center gap-2 mb-4">
          <h2 className="text-[var(--light-text)] text-xl font-bold m-0">Generated Schedules</h2>
          <Tooltip
            content="If you can't see a course selected above, then it probably has no schedule. If not sure, search for the course using the Search live button and try again. If all fails, report it in the form in the main page, bottom right."
            label="Generated schedules info"
          >
            <i className="fas fa-info-circle text-[var(--dark-text)]" aria-hidden />
          </Tooltip>
        </div>
        <div className="min-h-[200px]">
          {schedules.length === 0 && !generateLoading ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl bg-[var(--lighter-dark)] border border-white/10 text-center">
              <i className="fas fa-calendar-plus text-4xl text-[var(--dark-text)] mb-4" aria-hidden />
              <h3 className="text-[var(--light-text)] text-xl font-semibold m-0 mb-2">
                No schedules yet
              </h3>
              <p className="text-[var(--dark-text)] m-0 max-w-md">
                Add courses above, then click &quot;Generate Schedules&quot; to see your options here.
              </p>
            </div>
          ) : (
            <SchedulesList schedules={schedules} />
          )}
        </div>
      </section>

      <ConfirmDialog
        open={clearCartOpen}
        title="Clear Cart"
        message="Are you sure you want to clear your cart? This will remove all selected courses."
        confirmLabel="Clear"
        cancelLabel="Cancel"
        onConfirm={handleClearCartConfirm}
        onCancel={() => setClearCartOpen(false)}
      />
    </main>
  );
}
