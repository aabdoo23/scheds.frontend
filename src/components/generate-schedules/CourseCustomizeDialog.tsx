import { useEffect, useRef, useState, useCallback } from 'react';
import { fetchWithCredentials } from '@/lib/api';
import type { CustomCartItem } from '@/types/generate';
import { Button } from '@/components/ui/Button';
import { OptionChip } from '@/components/ui/OptionChip';
import { courseColor } from '@/lib/scheduleView';

interface CardItemSummary {
  instructor?: string;
  section?: string;
  subType?: string;
  scheduleDisplay?: string;
  Instructor?: string;
  Section?: string;
  SubType?: string;
  ScheduleDisplay?: string;
}

interface SectionDetail {
  section: string;
  instructor: string;
  scheduleDisplay: string;
}

type ExcludeKey =
  | 'excludedMainSections'
  | 'excludedSubSections'
  | 'excludedProfessors'
  | 'excludedTAs';

function normCard(c: CardItemSummary) {
  return {
    instructor: c.instructor ?? c.Instructor ?? '',
    section: c.section ?? c.Section ?? '',
    subType: c.subType ?? c.SubType ?? '',
    scheduleDisplay: c.scheduleDisplay ?? c.ScheduleDisplay ?? '',
  };
}

function dedupeSections(cards: ReturnType<typeof normCard>[], predicate: (len: number) => boolean) {
  const map = new Map<string, SectionDetail>();
  for (const c of cards) {
    if (c.section && predicate(c.section.length) && !map.has(c.section)) {
      map.set(c.section, {
        section: c.section,
        instructor: c.instructor,
        scheduleDisplay: c.scheduleDisplay,
      });
    }
  }
  return [...map.values()].sort((a, b) => a.section.localeCompare(b.section));
}

function uniqueInstructors(cards: ReturnType<typeof normCard>[], subTypes: string[]) {
  return [
    ...new Set(
      cards
        .filter((c) => subTypes.includes((c.subType || '').toLowerCase()))
        .map((c) => c.instructor)
        .filter((s): s is string => Boolean(s))
    ),
  ].sort();
}

interface CourseCustomizeDialogProps {
  open: boolean;
  item: CustomCartItem | null;
  onClose: () => void;
  onUpdate: (item: CustomCartItem) => void;
}

export function CourseCustomizeDialog({
  open,
  item,
  onClose,
  onUpdate,
}: CourseCustomizeDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);

  const [main, setMain] = useState<SectionDetail[]>([]);
  const [sub, setSub] = useState<SectionDetail[]>([]);
  const [professors, setProfessors] = useState<string[]>([]);
  const [tas, setTas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadedCode, setLoadedCode] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const code = item?.courseCode ?? '';

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      previousActiveRef.current = document.activeElement as HTMLElement | null;
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
      previousActiveRef.current?.focus();
      previousActiveRef.current = null;
    }
  }, [open]);

  const loadOptions = useCallback(async (courseCode: string) => {
    setLoading(true);
    try {
      const res = await fetchWithCredentials(`/api/card/${encodeURIComponent(courseCode)}`);
      if (res.ok) {
        const json = await res.json();
        const cards = (Array.isArray(json) ? json : []).map(normCard);
        setMain(dedupeSections(cards, (len) => len === 2));
        setSub(dedupeSections(cards, (len) => len > 2));
        setProfessors(uniqueInstructors(cards, ['lecture']));
        setTas(uniqueInstructors(cards, ['lab', 'tutorial']));
      }
    } catch {
      // leave whatever loaded; empty groups simply don't render
    } finally {
      setLoading(false);
      setLoadedCode(courseCode);
    }
  }, []);

  useEffect(() => {
    if (open && code && loadedCode !== code) {
      loadOptions(code);
    }
  }, [open, code, loadedCode, loadOptions]);

  if (!item) {
    return (
      <dialog
        ref={dialogRef}
        onCancel={(e) => {
          e.preventDefault();
          onClose();
        }}
        className="hidden"
        aria-hidden
      />
    );
  }

  const color = courseColor(item.courseCode);
  const excludedMain = item.excludedMainSections ?? [];
  const excludedSub = item.excludedSubSections ?? [];
  const excludedProf = item.excludedProfessors ?? [];
  const excludedTa = item.excludedTAs ?? [];
  const preferredProf = item.preferredProfessors ?? [];

  const setExcluded = (key: ExcludeKey, value: string[]) => {
    onUpdate({ ...item, [key]: value });
  };
  const toggle = (key: ExcludeKey, current: string[], value: string) => {
    setExcluded(
      key,
      current.includes(value) ? current.filter((x) => x !== value) : [...current, value]
    );
  };
  const keepOnly = (key: ExcludeKey, value: string, all: string[]) => {
    setExcluded(key, all.filter((v) => v !== value));
  };

  // Excluding a professor drops any preference for them (can't favor a skipped prof).
  const toggleExcludeProf = (value: string) => {
    const isExcluded = excludedProf.includes(value);
    onUpdate({
      ...item,
      excludedProfessors: isExcluded
        ? excludedProf.filter((x) => x !== value)
        : [...excludedProf, value],
      preferredProfessors: isExcluded ? preferredProf : preferredProf.filter((x) => x !== value),
    });
  };
  // Preferring a professor implies keeping them (removes any exclusion).
  const togglePrefer = (value: string) => {
    const isPref = preferredProf.includes(value);
    onUpdate({
      ...item,
      preferredProfessors: isPref
        ? preferredProf.filter((x) => x !== value)
        : [...preferredProf, value],
      excludedProfessors: isPref ? excludedProf : excludedProf.filter((x) => x !== value),
    });
  };
  const resetAll = () => {
    onUpdate({
      ...item,
      excludedMainSections: [],
      excludedSubSections: [],
      excludedProfessors: [],
      excludedTAs: [],
      preferredProfessors: [],
    });
  };

  const groups: {
    key: ExcludeKey;
    title: string;
    excluded: string[];
    options: { value: string; label: string; desc?: string }[];
    prefer?: boolean;
  }[] = [
    {
      key: 'excludedMainSections',
      title: 'Lecture sections',
      excluded: excludedMain,
      options: main.map((d) => ({
        value: d.section,
        label: d.section,
        desc: [d.instructor, d.scheduleDisplay].filter(Boolean).join(' · ') || undefined,
      })),
    },
    {
      key: 'excludedSubSections',
      title: 'Lab / tutorial sections',
      excluded: excludedSub,
      options: sub.map((d) => ({
        value: d.section,
        label: d.section,
        desc: [d.instructor, d.scheduleDisplay].filter(Boolean).join(' · ') || undefined,
      })),
    },
    {
      key: 'excludedProfessors',
      title: 'Professors',
      excluded: excludedProf,
      options: professors.map((p) => ({ value: p, label: p })),
      prefer: true,
    },
    {
      key: 'excludedTAs',
      title: 'Lab / tutorial instructors',
      excluded: excludedTa,
      options: tas.map((t) => ({ value: t, label: t })),
    },
  ];

  const anyOptions = groups.some((g) => g.options.length > 0);
  const totalOptions = groups.reduce((s, g) => s + g.options.length, 0);
  const totalKept = groups.reduce(
    (s, g) => s + g.options.filter((o) => !g.excluded.includes(o.value)).length,
    0
  );
  const anyExcluded = groups.some((g) => g.excluded.length > 0);
  const anyCustomized = anyExcluded || preferredProf.length > 0;

  return (
    <dialog
      ref={dialogRef}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className="z-[9999] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[min(92vw,40rem)] max-h-[85vh] p-0 rounded-xl border border-white/10 shadow-xl bg-[var(--lighter-dark)] text-[var(--light-text)] backdrop:bg-black/50"
      aria-modal="true"
      aria-labelledby="customize-title"
    >
      <div className="flex flex-col max-h-[85vh]">
        <div className="flex items-start justify-between gap-3 p-5 border-b border-white/10 shrink-0">
          <div className="flex items-start gap-2.5 min-w-0">
            <span
              className="mt-1.5 w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: color.bg }}
              aria-hidden
            />
            <div className="min-w-0">
              <h2 id="customize-title" className="text-lg font-semibold m-0 leading-tight">
                {item.courseCode}
              </h2>
              <p className="text-[var(--dark-text)] text-sm m-0 leading-snug truncate">
                {item.courseName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 min-w-[44px] min-h-[44px] -mt-1.5 -mr-1.5 flex items-center justify-center rounded-lg text-[var(--dark-text)] hover:text-[var(--light-text)] hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-blue)]"
          >
            <i className="fas fa-times text-lg" aria-hidden />
          </button>
        </div>

        <div className="overflow-y-auto schedules-scroll p-5 flex flex-col gap-5">
          {loading ? (
            <div className="flex items-center gap-2 text-[var(--dark-text)] text-sm py-6 justify-center">
              <i className="fas fa-circle-notch fa-spin" aria-hidden />
              Loading sections…
            </div>
          ) : !anyOptions ? (
            <p className="text-[var(--dark-text)] text-sm text-center py-6 m-0">
              No section options available for this course.
            </p>
          ) : (
            <>
              <div
                className="flex items-center justify-between gap-3 text-sm rounded-lg bg-white/[0.03] border border-white/10 px-3 py-2"
                aria-live="polite"
              >
                <span className="text-[var(--dark-text)]">
                  Keeping{' '}
                  <span className="text-[var(--light-text)] font-semibold tabular-nums">
                    {totalKept}
                  </span>{' '}
                  of {totalOptions} options
                </span>
                <span className="text-[var(--dark-text)] text-xs">Unchecked = skipped</span>
              </div>

              {groups
                .filter((g) => g.options.length > 0)
                .map((g) => {
                  const keptCount = g.options.filter(
                    (o) => !g.excluded.includes(o.value)
                  ).length;
                  const q = (filters[g.key] ?? '').trim().toLowerCase();
                  const shown = q
                    ? g.options.filter(
                        (o) =>
                          o.label.toLowerCase().includes(q) ||
                          (o.desc ?? '').toLowerCase().includes(q)
                      )
                    : g.options;
                  const showFilter = g.options.length > 8;
                  const showOnly = g.options.length > 1;
                  return (
                    <fieldset key={g.key} className="border-0 p-0 m-0">
                      <div className="flex items-center justify-between gap-3 mb-2.5">
                        <legend className="text-[var(--light-text)] text-sm font-semibold p-0">
                          {g.title}{' '}
                          <span className="text-[var(--dark-text)] font-normal">
                            ({keptCount}/{g.options.length} kept)
                          </span>
                        </legend>
                        <div className="flex items-center gap-3 text-xs">
                          <button
                            type="button"
                            onClick={() => setExcluded(g.key, [])}
                            className="text-[var(--light-blue)] hover:underline focus:outline-none focus-visible:underline"
                          >
                            Keep all
                          </button>
                          <button
                            type="button"
                            onClick={() => setExcluded(g.key, g.options.map((o) => o.value))}
                            className="text-[var(--dark-text)] hover:text-[var(--light-text)] hover:underline focus:outline-none focus-visible:underline"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                      {g.prefer && (
                        <p className="text-[var(--dark-text)] text-xs m-0 mb-2.5 flex items-center gap-1.5">
                          <i className="fas fa-star text-[var(--light-blue)] text-[0.6rem]" aria-hidden />
                          Star a professor to rank their schedules higher , a preference, never required.
                        </p>
                      )}
                      {showFilter && (
                        <input
                          type="text"
                          value={filters[g.key] ?? ''}
                          onChange={(e) =>
                            setFilters((f) => ({ ...f, [g.key]: e.target.value }))
                          }
                          placeholder={`Filter ${g.title.toLowerCase()}…`}
                          aria-label={`Filter ${g.title}`}
                          className="w-full mb-2.5 py-2 px-3 rounded-md bg-[var(--dark)] border border-white/10 text-sm text-[var(--light-text)] placeholder:text-[var(--dark-text)] outline-none focus:border-[var(--light-blue)]"
                        />
                      )}
                      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2">
                        {shown.map((o) => {
                          const kept = !g.excluded.includes(o.value);
                          const preferred = g.prefer && preferredProf.includes(o.value);
                          return (
                          <div key={o.value} className="flex items-stretch gap-1">
                            <OptionChip
                              type="checkbox"
                              label={o.label}
                              desc={o.desc}
                              checked={kept}
                              onChange={() =>
                                g.prefer
                                  ? toggleExcludeProf(o.value)
                                  : toggle(g.key, g.excluded, o.value)
                              }
                              className="flex-1"
                            />
                            {g.prefer && kept && (
                              <button
                                type="button"
                                onClick={() => togglePrefer(o.value)}
                                aria-pressed={preferred}
                                title={preferred ? `Stop preferring ${o.label}` : `Prefer ${o.label}`}
                                aria-label={preferred ? `Stop preferring ${o.label}` : `Prefer ${o.label}`}
                                className={`shrink-0 w-11 min-h-[44px] flex items-center justify-center rounded-md border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-blue)] ${
                                  preferred
                                    ? 'border-[var(--light-blue)] bg-[var(--light-blue)]/15 text-[var(--light-blue)]'
                                    : 'border-white/10 bg-white/[0.02] text-[var(--dark-text)] hover:text-[var(--light-text)] hover:border-[var(--light-blue)]'
                                }`}
                              >
                                <i className="fas fa-star text-xs" aria-hidden />
                              </button>
                            )}
                            {showOnly && (
                              <button
                                type="button"
                                onClick={() =>
                                  keepOnly(g.key, o.value, g.options.map((x) => x.value))
                                }
                                title={`Keep only ${o.label}`}
                                aria-label={`Keep only ${o.label}`}
                                className="shrink-0 w-11 min-h-[44px] flex items-center justify-center rounded-md border border-white/10 bg-white/[0.02] text-[var(--dark-text)] transition-colors hover:text-[var(--light-text)] hover:border-[var(--light-blue)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-blue)]"
                              >
                                <i className="fas fa-bullseye text-xs" aria-hidden />
                              </button>
                            )}
                          </div>
                          );
                        })}
                        {shown.length === 0 && (
                          <p className="text-[var(--dark-text)] text-xs m-0 py-1">
                            No matches.
                          </p>
                        )}
                      </div>
                      {keptCount === 0 && (
                        <p role="alert" className="text-[var(--btn-danger)] text-xs mt-2 m-0">
                          Nothing kept here , this course can’t be scheduled until you keep at least one.
                        </p>
                      )}
                    </fieldset>
                  );
                })}
            </>
          )}
        </div>

        <div className="flex justify-between items-center gap-3 p-5 border-t border-white/10 shrink-0">
          <Button variant="secondary" onClick={resetAll} disabled={!anyCustomized}>
            Reset
          </Button>
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    </dialog>
  );
}
