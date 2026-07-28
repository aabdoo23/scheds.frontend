import {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type RefObject,
  type ReactNode,
} from 'react';
import { fetchWithCredentials } from '@/lib/api';
import { courseColor } from '@/lib/scheduleView';
import { useGenerateCart } from '@/hooks/useGenerateCart';
import { useGenerateRequest } from '@/hooks/useGenerateRequest';
import { useCourseSearchDebounced } from '@/hooks/useCourseSearchDebounced';
import type {
  GenerateRequest,
  GenerateResponse,
  ScheduleCardItem,
  CustomCartItem,
  BusyTime,
} from '@/types/generate';
import { SearchSection } from '@/components/generate-schedules/SearchSection';
import { CartList } from '@/components/generate-schedules/CartList';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { CustomizationForm } from '@/components/generate-schedules/CustomizationForm';
import { SchedulesList } from '@/components/generate-schedules/SchedulesList';

type GenerateStatus = 'idle' | 'loading' | 'success' | 'error';

const RESULTS_KEY = 'scheds:generate-results';
const SIGNATURE_KEY = 'scheds:generate-signature';
const META_KEY = 'scheds:generate-meta';

interface GenMeta {
  explored: number;
  truncated: boolean;
}

function loadStoredSchedules(): ScheduleCardItem[][] {
  try {
    const raw = sessionStorage.getItem(RESULTS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadStoredMeta(): GenMeta | null {
  try {
    const raw = sessionStorage.getItem(META_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed.explored === 'number') {
      return { explored: parsed.explored, truncated: !!parsed.truncated };
    }
    return null;
  } catch {
    return null;
  }
}

function loadStoredSignature(): string | null {
  try {
    return sessionStorage.getItem(SIGNATURE_KEY);
  } catch {
    return null;
  }
}

function generateErrorMessage(status: number): string {
  if (status === 429) return 'Too many requests right now. Wait a moment, then try again.';
  if (status === 401 || status === 403)
    return 'Your session expired. Refresh the page (and sign in again if prompted), then try again.';
  if (status >= 500) return 'The server hit a problem building your schedules. Try again in a moment.';
  return 'Something went wrong building your schedules. Try again.';
}

export function GenerateSchedulesPage() {
  const [query, setQuery] = useState('');
  const [schedules, setSchedules] = useState<ScheduleCardItem[][]>(loadStoredSchedules);
  const [genStatus, setGenStatus] = useState<GenerateStatus>(
    schedules.length > 0 ? 'success' : 'idle'
  );
  const [generatedSignature, setGeneratedSignature] = useState<string | null>(loadStoredSignature);
  const [genMeta, setGenMeta] = useState<GenMeta | null>(loadStoredMeta);
  const [genError, setGenError] = useState<string | null>(null);
  const generateLoading = genStatus === 'loading';
  const [searchLiveLoading, setSearchLiveLoading] = useState(false);
  const [searchLiveError, setSearchLiveError] = useState(false);
  const [cartLimitError, setCartLimitError] = useState(false);
  const [clearCartOpen, setClearCartOpen] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState<string | null>(null);
  const [spineVisible, setSpineVisible] = useState(false);

  const coursesRef = useRef<HTMLElement | null>(null);
  const prefsRef = useRef<HTMLElement | null>(null);
  const resultsRef = useRef<HTMLElement | null>(null);
  const resultsHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const justGenerated = useRef(false);

  useEffect(() => {
    if (!addedFeedback) return;
    const t = setTimeout(() => setAddedFeedback(null), 2000);
    return () => clearTimeout(t);
  }, [addedFeedback]);

  // Reveal the sticky spine once the courses stage has scrolled above the navbar,
  // so the cart + primary action stay reachable while tuning and reviewing.
  useEffect(() => {
    const el = coursesRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(
      ([entry]) => setSpineVisible(!entry.isIntersecting),
      { rootMargin: '-80px 0px 0px 0px', threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const {
    cart,
    liveSearchLoading,
    addToCart,
    removeFromCart,
    clearCart,
    hasCustomSelection,
  } = useGenerateCart();

  const { request, updateRequest, resetRequest } = useGenerateRequest();
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
    setSearchLiveError(false);
    try {
      const res = await fetchWithCredentials(
        `/api/coursebase/search/${encodeURIComponent(trimmed)}`
      );
      if (!res.ok) setSearchLiveError(true);
    } catch {
      setSearchLiveError(true);
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
      preferredProfessors: c.preferredProfessors?.filter(Boolean),
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

  // Signature of the exact inputs a generation depends on. When the live inputs
  // drift from what produced the current results, those results are stale.
  const currentSignature = useMemo(
    () => JSON.stringify(buildGenerateRequest()),
    [buildGenerateRequest]
  );
  const resultsStale =
    genStatus === 'success' &&
    generatedSignature !== null &&
    currentSignature !== generatedSignature;

  // Busy blocks are drawn from the request that produced the shown results, not
  // the live form , so editing them after generating never misrepresents the canvas.
  const generatedBusyTimes = useMemo<BusyTime[]>(() => {
    if (!generatedSignature) return [];
    try {
      const parsed = JSON.parse(generatedSignature);
      return Array.isArray(parsed?.busyTimes) ? parsed.busyTimes : [];
    } catch {
      return [];
    }
  }, [generatedSignature]);

  const canGenerate = cart.length > 0 && request.daysStart < request.daysEnd;

  const scrollTo = useCallback((el: HTMLElement | null) => {
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }, []);

  // After a fresh generate, hand the viewport + focus to the results , this is the
  // payoff moment and it lives well below the fold.
  useEffect(() => {
    if (genStatus !== 'success' || !justGenerated.current) return;
    justGenerated.current = false;
    scrollTo(resultsRef.current);
    resultsHeadingRef.current?.focus({ preventScroll: true });
  }, [genStatus, schedules, scrollTo]);

  const handleGenerate = useCallback(async () => {
    const genRequest = buildGenerateRequest();
    const signature = JSON.stringify(genRequest);

    setGenStatus('loading');
    setGenError(null);
    try {
      const res = await fetchWithCredentials('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(genRequest),
      });

      if (!res.ok) {
        setGenError(generateErrorMessage(res.status));
        setGenStatus('error');
        return;
      }

      const json = await res.json();
      // Envelope { schedules, explored, truncated }; fall back to a bare array.
      const data: ScheduleCardItem[][] = Array.isArray(json)
        ? json
        : Array.isArray((json as GenerateResponse)?.schedules)
          ? (json as GenerateResponse).schedules
          : [];
      const meta: GenMeta | null = Array.isArray(json)
        ? null
        : {
            explored: (json as GenerateResponse)?.explored ?? data.length,
            truncated: !!(json as GenerateResponse)?.truncated,
          };
      justGenerated.current = true;
      setSchedules(data);
      setGenMeta(meta);
      setGenStatus('success');
      setGeneratedSignature(signature);
      try {
        sessionStorage.setItem(RESULTS_KEY, JSON.stringify(data));
        sessionStorage.setItem(SIGNATURE_KEY, signature);
        if (meta) sessionStorage.setItem(META_KEY, JSON.stringify(meta));
        else sessionStorage.removeItem(META_KEY);
      } catch {
        // storage full or unavailable , results still live in state this session
      }
    } catch {
      setGenError("Couldn't reach the server. Check your connection, then try again.");
      setGenStatus('error');
    }
  }, [buildGenerateRequest]);

  return (
    <main className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h1 className="text-[var(--light-text)] text-2xl sm:text-3xl font-bold m-0 mb-5 tracking-tight">
        Generate schedules
      </h1>

      {/* Sticky spine , keeps the cart and primary action in reach while scrolling */}
      <PipelineSpine
        visible={spineVisible}
        cart={cart}
        canGenerate={canGenerate}
        loading={generateLoading}
        onGenerate={handleGenerate}
        onJumpToCourses={() => scrollTo(coursesRef.current)}
      />

      {addedFeedback && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-[var(--light-blue)] text-white font-medium flex items-center gap-2 shadow-lg"
        >
          <i className="fas fa-check" aria-hidden />
          {addedFeedback} added to cart
        </div>
      )}

      {/* Set-up deck , selections + preferences on top */}
      <div className="xl:grid xl:grid-cols-[2fr_3fr] xl:gap-6 xl:items-start mb-8">
      {/* Stage 1 , Choose courses */}
      <section
        ref={coursesRef}
        aria-labelledby="stage-courses"
        className="mb-8 xl:mb-0 scroll-mt-[calc(var(--navbar-height)+5rem)]"
      >
        <StageHeading
          id="stage-courses"
          title="Choose courses"
          hint="Search NU's catalog and add up to 8 courses."
        />
        <div className="flex flex-col gap-5">
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
            cartCourseCodes={cart.map((c) => c.courseCode)}
            cartLimitError={cartLimitError}
            onCartLimitErrorDismiss={() => setCartLimitError(false)}
            searchLiveError={searchLiveError}
          />
          <CartList
            cart={cart}
            onRemove={removeFromCart}
            onClear={handleClearCartClick}
            onUpdate={handleUpdateCartItem}
            hasCustomSelection={hasCustomSelection}
          />
        </div>
      </section>

      {/* Stage 2 , Set preferences */}
      <section
        ref={prefsRef}
        aria-labelledby="stage-prefs"
        className="scroll-mt-[calc(var(--navbar-height)+5rem)]"
      >
        <StageHeading
          id="stage-prefs"
          title="Set preferences"
          hint="Defaults work for most students , adjust only what you care about."
          action={
            <Button variant="ghost" onClick={resetRequest} className="px-3 text-sm">
              <i className="fas fa-rotate-left mr-2" aria-hidden />
              Reset
            </Button>
          }
        />
        <CustomizationForm request={request} onUpdate={updateRequest} />
      </section>
      </div>

      {/* Generate action , the seam between set-up and schedules */}
      <div className="mb-10">
        {cart.length === 0 ? (
          <div className="flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-[var(--lighter-dark)]/40 px-4 py-5 text-center">
            <i className="fas fa-arrow-up text-[var(--dark-text)]" aria-hidden />
            <p className="text-[var(--dark-text)] text-sm m-0">
              Add at least one course to generate schedules.
            </p>
          </div>
        ) : (
          <>
            <Button
              onClick={handleGenerate}
              disabled={generateLoading || !canGenerate}
              aria-busy={generateLoading}
              fullWidth
              className="py-4 text-xl"
            >
              {generateLoading ? (
                <>
                  <i className="fas fa-circle-notch fa-spin mr-2" aria-hidden />
                  Generating&hellip;
                </>
              ) : (
                'Generate Schedules'
              )}
            </Button>
            {request.daysStart >= request.daysEnd && (
              <p role="alert" className="text-[var(--btn-danger)] text-sm mt-2 mb-0 flex items-center gap-2">
                <i className="fas fa-triangle-exclamation" aria-hidden />
                Fix the class-hours range above before generating.
              </p>
            )}
          </>
        )}
      </div>

      {/* Stage 3 , Schedules (full width) */}
      <section
        ref={resultsRef}
        role="region"
        aria-labelledby="stage-results"
        aria-live="polite"
        className="scroll-mt-[calc(var(--navbar-height)+1rem)]"
      >
        <StageHeading
          id="stage-results"
          headingRef={resultsHeadingRef}
          title="Review schedules"
        />
        <div className="min-h-[200px]">
          {genStatus === 'loading' ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl bg-[var(--lighter-dark)] border border-white/10 text-center">
              <i className="fas fa-circle-notch fa-spin text-4xl text-[var(--light-blue)] mb-4" aria-hidden />
              <h3 className="text-[var(--light-text)] text-xl font-semibold m-0 mb-2">
                Building your schedules&hellip;
              </h3>
              <p className="text-[var(--dark-text)] m-0 max-w-md">
                Crunching every combination that fits your courses and preferences.
              </p>
            </div>
          ) : genStatus === 'error' ? (
            <div
              role="alert"
              className="flex flex-col items-center justify-center py-12 px-4 rounded-xl bg-[var(--lighter-dark)] border border-[var(--btn-danger)]/40 text-center"
            >
              <i className="fas fa-triangle-exclamation text-4xl text-[var(--btn-danger)] mb-4" aria-hidden />
              <h3 className="text-[var(--light-text)] text-xl font-semibold m-0 mb-2">
                Couldn&apos;t generate schedules
              </h3>
              <p className="text-[var(--light-text)]/80 m-0 mb-5 max-w-md">
                {genError}
              </p>
              <Button onClick={handleGenerate} className="min-w-[10rem]">
                <i className="fas fa-rotate-right mr-2" aria-hidden />
                Try again
              </Button>
            </div>
          ) : genStatus === 'success' ? (
            <>
              {resultsStale && (
                <div
                  role="status"
                  className="mb-4 p-3 rounded-lg bg-[var(--card-yellow)]/15 border border-[var(--card-yellow)]/50 text-[var(--light-text)] text-sm flex flex-wrap items-center justify-between gap-3"
                >
                  <span className="flex items-center gap-2">
                    <i className="fas fa-triangle-exclamation text-[var(--card-yellow)]" aria-hidden />
                    Your courses or preferences changed since these were generated.
                  </span>
                  <Button onClick={handleGenerate} className="shrink-0">
                    <i className="fas fa-rotate-right mr-2" aria-hidden />
                    Regenerate
                  </Button>
                </div>
              )}
              <SchedulesList
                schedules={schedules}
                busyTimes={generatedBusyTimes}
                explored={genMeta?.explored}
                truncated={genMeta?.truncated}
              />
              <MissingCourseHelp />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl bg-[var(--lighter-dark)] border border-white/10 text-center">
              <i className="fas fa-calendar-plus text-4xl text-[var(--dark-text)] mb-4" aria-hidden />
              <h3 className="text-[var(--light-text)] text-xl font-semibold m-0 mb-2">
                No schedules yet
              </h3>
              <p className="text-[var(--dark-text)] m-0 max-w-md">
                Your generated timetables will appear here.
              </p>
            </div>
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

function StageHeading({
  id,
  title,
  hint,
  action,
  headingRef,
}: {
  id: string;
  title: string;
  hint?: string;
  action?: ReactNode;
  headingRef?: RefObject<HTMLHeadingElement | null>;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
      <div className="min-w-0">
        <h2
          id={id}
          ref={headingRef}
          tabIndex={headingRef ? -1 : undefined}
          className="text-[var(--light-text)] text-xl font-semibold m-0 leading-tight outline-none"
        >
          {title}
        </h2>
        {hint && <p className="text-[var(--dark-text)] text-sm m-0 mt-0.5">{hint}</p>}
      </div>
      {action && <div className="shrink-0 flex items-center gap-2 pt-1">{action}</div>}
    </div>
  );
}

function MissingCourseHelp() {
  return (
    <details className="group mt-4 rounded-xl bg-[var(--lighter-dark)] border border-white/10">
      <summary className="flex items-center gap-2 cursor-pointer list-none [&::-webkit-details-marker]:hidden px-4 py-3 text-sm font-medium text-[var(--light-text)] rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-blue)]">
        <i className="fas fa-circle-question text-[var(--dark-text)]" aria-hidden />
        Missing a course?
        <i
          className="fas fa-chevron-down text-[var(--dark-text)] ml-auto transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <ol className="m-0 px-4 pb-4 pl-9 flex flex-col gap-1.5 list-decimal text-sm text-[var(--dark-text)]">
        <li>
          It may have no section that fits , loosen your preferences (days, hours, gaps) and generate
          again.
        </li>
        <li>
          Not cached yet? Use <span className="text-[var(--light-text)] font-medium">Search NU live</span>{' '}
          in the search box above, then generate again.
        </li>
        <li>Still missing? Report it via the form on the main page (bottom-right).</li>
      </ol>
    </details>
  );
}

function PipelineSpine({
  visible,
  cart,
  canGenerate,
  loading,
  onGenerate,
  onJumpToCourses,
}: {
  visible: boolean;
  cart: CustomCartItem[];
  canGenerate: boolean;
  loading: boolean;
  onGenerate: () => void;
  onJumpToCourses: () => void;
}) {
  return (
    <div
      aria-hidden={!visible}
      className={`sticky top-[var(--navbar-height)] z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 ${
        visible ? '' : 'h-0 overflow-hidden'
      }`}
    >
      <div
        className={`my-2 flex items-center gap-3 rounded-xl border border-white/10 bg-[var(--lighter-dark)] px-3 py-2 shadow-lg sm:px-4 transition-all duration-200 motion-reduce:transition-none ${
          visible ? 'visible opacity-100 translate-y-0' : 'invisible opacity-0 -translate-y-2'
        }`}
      >
        <button
          type="button"
          onClick={onJumpToCourses}
          className="flex items-center gap-2 min-w-0 rounded-lg py-1.5 px-2 transition-colors hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-blue)]"
        >
          <i className="fas fa-cart-shopping text-[var(--dark-text)]" aria-hidden />
          <span className="text-sm font-semibold text-[var(--light-text)] tabular-nums">
            {cart.length}
            <span className="text-[var(--dark-text)] font-normal">/8</span>
          </span>
          {cart.length > 0 && (
            <span className="hidden sm:flex items-center gap-1 ml-1" aria-hidden>
              {cart.slice(0, 8).map((c) => (
                <span
                  key={c.courseCode}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: courseColor(c.courseCode).bg }}
                />
              ))}
            </span>
          )}
          <span className="sr-only">courses in cart , jump to courses</span>
        </button>
        <div className="flex-1" />
        <Button
          onClick={onGenerate}
          disabled={loading || !canGenerate}
          aria-busy={loading}
          className="shrink-0 px-4 py-2 text-sm"
        >
          {loading ? (
            <>
              <i className="fas fa-circle-notch fa-spin mr-2" aria-hidden />
              Generating&hellip;
            </>
          ) : (
            <>
              <i className="fas fa-bolt mr-2" aria-hidden />
              Generate
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
