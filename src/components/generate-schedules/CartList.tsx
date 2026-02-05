import { useState, useCallback, useEffect, useRef } from 'react';
import { fetchWithCredentials } from '@/lib/api';
import type { CustomCartItem } from '@/types/generate';

interface CardItemSummary {
  courseCode?: string;
  instructor?: string;
  section?: string;
  subType?: string;
  scheduleDisplay?: string;
  CourseCode?: string;
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

function normCard(c: CardItemSummary) {
  return {
    instructor: c.instructor ?? c.Instructor ?? '',
    section: c.section ?? c.Section ?? '',
    subType: c.subType ?? c.SubType ?? '',
    scheduleDisplay: c.scheduleDisplay ?? c.ScheduleDisplay ?? '',
  };
}

interface CartListProps {
  cart: CustomCartItem[];
  onRemove: (item: CustomCartItem) => void;
  onClear: () => void;
  onUpdate: (item: CustomCartItem) => void;
  hasCustomSelection: (item: CustomCartItem) => boolean;
}

export function CartList({
  cart,
  onRemove,
  onClear,
  onUpdate,
  hasCustomSelection,
}: CartListProps) {
  return (
    <div className="bg-[var(--lighter-dark)] max-h-[min(400px,40vh)] rounded-xl p-5 border border-white/10 flex-1 lg:max-h-[400px] flex flex-col min-h-0">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <h2 className="text-[var(--light-text)] text-xl m-0">Your Courses</h2>
        <button
          type="button"
          onClick={onClear}
          disabled={cart.length === 0}
          aria-label="Clear all courses from cart"
          className="py-1.5 px-2.5 bg-transparent border border-[var(--light-text)] text-[var(--light-text)] rounded-md text-[0.9rem] cursor-pointer transition-colors hover:bg-[#dc3545] hover:border-[#dc3545] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear Cart
        </button>
      </div>
      <ul className="schedules-scroll list-none p-0 m-0 flex-1 min-h-0 overflow-y-auto">
        {cart.map((item) => (
          <CartItem
            key={item.courseCode}
            item={item}
            onRemove={() => onRemove(item)}
            onUpdate={onUpdate}
            hasCustomSelection={hasCustomSelection(item)}
          />
        ))}
      </ul>
    </div>
  );
}

function CartItem({
  item,
  onRemove,
  onUpdate,
  hasCustomSelection,
}: {
  item: CustomCartItem;
  onRemove: () => void;
  onUpdate: (item: CustomCartItem) => void;
  hasCustomSelection: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const expandedRef = useRef<HTMLDivElement>(null);
  const [mainSectionDetails, setMainSectionDetails] = useState<SectionDetail[]>([]);
  const [subSectionDetails, setSubSectionDetails] = useState<SectionDetail[]>([]);
  const [professors, setProfessors] = useState<string[]>([]);
  const [tas, setTas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadOptions = useCallback(async () => {
    if (loaded) return;
    setLoading(true);
    try {
      const res = await fetchWithCredentials(`/api/card/${encodeURIComponent(item.courseCode)}`);
      if (res.ok) {
        const json = await res.json();
        const cards = (Array.isArray(json) ? json : []).map(normCard);
        const mainSec = cards
          .filter((c) => (c.section?.length ?? 0) === 2)
          .reduce<Map<string, SectionDetail>>((acc, c) => {
            if (c.section && !acc.has(c.section)) {
              acc.set(c.section, {
                section: c.section,
                instructor: c.instructor,
                scheduleDisplay: c.scheduleDisplay,
              });
            }
            return acc;
          }, new Map());
        const subSec = cards
          .filter((c) => (c.section?.length ?? 0) > 2)
          .reduce<Map<string, SectionDetail>>((acc, c) => {
            if (c.section && !acc.has(c.section)) {
              acc.set(c.section, {
                section: c.section,
                instructor: c.instructor,
                scheduleDisplay: c.scheduleDisplay,
              });
            }
            return acc;
          }, new Map());
        const prof = [
          ...new Set(
            cards
              .filter((c) => (c.subType || '').toLowerCase() === 'lecture')
              .map((c) => c.instructor)
              .filter((s): s is string => Boolean(s))
          ),
        ].sort();
        const taList = [
          ...new Set(
            cards
              .filter((c) =>
                ['lab', 'tutorial'].includes((c.subType || '').toLowerCase())
              )
              .map((c) => c.instructor)
              .filter((s): s is string => Boolean(s))
          ),
        ].sort();
        setMainSectionDetails([...mainSec.values()].sort((a, b) => a.section.localeCompare(b.section)));
        setSubSectionDetails([...subSec.values()].sort((a, b) => a.section.localeCompare(b.section)));
        setProfessors(prof);
        setTas(taList);
        setLoaded(true);
      }
    } catch {
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  }, [item.courseCode, loaded]);

  useEffect(() => {
    if (expanded) loadOptions();
  }, [expanded, loadOptions]);

  useEffect(() => {
    if (expanded && !loading && expandedRef.current) {
      const firstFocusable = expandedRef.current.querySelector<HTMLElement>(
        'input[type="checkbox"], button'
      );
      firstFocusable?.focus();
    }
  }, [expanded, loading]);

  const toArr = (v: string[] | undefined) => v ?? [];
  const excludedMain = toArr(item.excludedMainSections);
  const excludedSub = toArr(item.excludedSubSections);
  const excludedProfessors = toArr(item.excludedProfessors);
  const excludedTas = toArr(item.excludedTAs);

  const customDetails: string[] = [];
  if (excludedMain.length > 0) customDetails.push(`Excluded main: ${excludedMain.join(', ')}`);
  if (excludedSub.length > 0) customDetails.push(`Excluded sub: ${excludedSub.join(', ')}`);
  if (excludedProfessors.length > 0) customDetails.push(`Excluded prof: ${excludedProfessors.join(', ')}`);
  if (excludedTas.length > 0) customDetails.push(`Excluded TA: ${excludedTas.join(', ')}`);

  const toggleExcludedMain = (s: string) => {
    const next = excludedMain.includes(s) ? excludedMain.filter((x) => x !== s) : [...excludedMain, s];
    onUpdate({ ...item, excludedMainSections: next });
  };
  const toggleExcludedSub = (s: string) => {
    const next = excludedSub.includes(s) ? excludedSub.filter((x) => x !== s) : [...excludedSub, s];
    onUpdate({ ...item, excludedSubSections: next });
  };
  const toggleExcludedProfessor = (p: string) => {
    const next = excludedProfessors.includes(p) ? excludedProfessors.filter((x) => x !== p) : [...excludedProfessors, p];
    onUpdate({ ...item, excludedProfessors: next });
  };
  const toggleExcludedTa = (t: string) => {
    const next = excludedTas.includes(t) ? excludedTas.filter((x) => x !== t) : [...excludedTas, t];
    onUpdate({ ...item, excludedTAs: next });
  };

  const excludeAllMain = () => onUpdate({ ...item, excludedMainSections: mainSectionDetails.map((d) => d.section) });
  const excludeAllSub = () => onUpdate({ ...item, excludedSubSections: subSectionDetails.map((d) => d.section) });
  const excludeAllProfessors = () => onUpdate({ ...item, excludedProfessors: professors });
  const excludeAllTas = () => onUpdate({ ...item, excludedTAs: tas });

  return (
    <li className="py-3 px-4 bg-[var(--light-blue)] text-white rounded-lg mb-2.5 transition-colors hover:bg-[var(--dark-blue)]">
      <div className="flex justify-between items-center gap-2">
        <div className="flex-1 min-w-0">
          <p className="m-0 text-base leading-snug">
            <strong>
              {item.courseCode}: {item.courseName}
            </strong>
            {hasCustomSelection && (
              <span className="ml-1 text-[0.75rem] opacity-90">Custom</span>
            )}
          </p>
          {hasCustomSelection && customDetails.length > 0 && (
            <p
              className="m-0 mt-0.5 text-[0.8rem] leading-snug opacity-90 line-clamp-2"
              title={customDetails.join(' · ')}
            >
              {customDetails.join(' · ')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            aria-label={`Customize sections for ${item.courseCode}`}
            className="p-1.5 min-w-[40px] min-h-[40px] flex items-center justify-center bg-transparent border-none text-inherit cursor-pointer opacity-80 hover:opacity-100 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <i className="fas fa-cog" aria-hidden />
          </button>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${item.courseCode} from cart`}
            className="p-1.5 min-w-[40px] min-h-[40px] flex items-center justify-center bg-transparent border-none text-inherit cursor-pointer opacity-80 hover:opacity-100 hover:bg-white/20 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <i className="fas fa-times" aria-hidden />
          </button>
        </div>
      </div>
      {expanded && (
        <div ref={expandedRef} className="mt-2.5 pt-2.5 border-t border-white/30">
          {loading ? (
            <div className="text-sm">Loading...</div>
          ) : (
            <div className="flex flex-col gap-3">
              <fieldset>
                <legend className="text-[0.9rem] font-medium mb-1">Main Sections (exclude)</legend>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {mainSectionDetails.length > 0 && (
                    <button
                      type="button"
                      onClick={excludeAllMain}
                      className="text-[0.75rem] py-1 px-2 rounded bg-white/10 hover:bg-white/20"
                    >
                      Exclude all
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {mainSectionDetails.map((d) => (
                    <label
                      key={d.section}
                      className="flex items-center gap-2 cursor-pointer text-[0.9rem] py-1 px-2 rounded bg-[var(--lighter-dark)] hover:bg-white/10"
                    >
                      <input
                        type="checkbox"
                        checked={excludedMain.includes(d.section)}
                        onChange={() => toggleExcludedMain(d.section)}
                        className="rounded"
                      />
                      <span>
                        {d.section}
                        {(d.instructor || d.scheduleDisplay) && (
                          <span className="ml-1.5 opacity-80 text-[0.85rem]">
                            ({[d.instructor, d.scheduleDisplay].filter(Boolean).join(' · ')})
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="text-[0.9rem] font-medium mb-1">Subsections (exclude)</legend>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {subSectionDetails.length > 0 && (
                    <button
                      type="button"
                      onClick={excludeAllSub}
                      className="text-[0.75rem] py-1 px-2 rounded bg-white/10 hover:bg-white/20"
                    >
                      Exclude all
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {subSectionDetails.map((d) => (
                    <label
                      key={d.section}
                      className="flex items-center gap-2 cursor-pointer text-[0.9rem] py-1 px-2 rounded bg-[var(--lighter-dark)] hover:bg-white/10"
                    >
                      <input
                        type="checkbox"
                        checked={excludedSub.includes(d.section)}
                        onChange={() => toggleExcludedSub(d.section)}
                        className="rounded"
                      />
                      <span>
                        {d.section}
                        {(d.instructor || d.scheduleDisplay) && (
                          <span className="ml-1.5 opacity-80 text-[0.85rem]">
                            ({[d.instructor, d.scheduleDisplay].filter(Boolean).join(' · ')})
                          </span>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="text-[0.9rem] font-medium mb-1">Professor (exclude)</legend>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {professors.length > 0 && (
                    <button
                      type="button"
                      onClick={excludeAllProfessors}
                      className="text-[0.75rem] py-1 px-2 rounded bg-white/10 hover:bg-white/20"
                    >
                      Exclude all
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {professors.map((p) => (
                    <label
                      key={p}
                      className="flex items-center gap-2 cursor-pointer text-[0.9rem] py-1 px-2 rounded bg-[var(--lighter-dark)] hover:bg-white/10"
                    >
                      <input
                        type="checkbox"
                        checked={excludedProfessors.includes(p)}
                        onChange={() => toggleExcludedProfessor(p)}
                        className="rounded"
                      />
                      {p}
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="text-[0.9rem] font-medium mb-1">TA (exclude)</legend>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {tas.length > 0 && (
                    <button
                      type="button"
                      onClick={excludeAllTas}
                      className="text-[0.75rem] py-1 px-2 rounded bg-white/10 hover:bg-white/20"
                    >
                      Exclude all
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {tas.map((t) => (
                    <label
                      key={t}
                      className="flex items-center gap-2 cursor-pointer text-[0.9rem] py-1 px-2 rounded bg-[var(--lighter-dark)] hover:bg-white/10"
                    >
                      <input
                        type="checkbox"
                        checked={excludedTas.includes(t)}
                        onChange={() => toggleExcludedTa(t)}
                        className="rounded"
                      />
                      {t}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          )}
        </div>
      )}
    </li>
  );
}
