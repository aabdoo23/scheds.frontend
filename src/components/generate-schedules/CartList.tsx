import { useState } from 'react';
import type { CustomCartItem } from '@/types/generate';
import { Button } from '@/components/ui/Button';
import { courseColor } from '@/lib/scheduleView';
import { CourseCustomizeDialog } from './CourseCustomizeDialog';

interface CartListProps {
  cart: CustomCartItem[];
  onRemove: (item: CustomCartItem) => void;
  onClear: () => void;
  onUpdate: (item: CustomCartItem) => void;
  hasCustomSelection: (item: CustomCartItem) => boolean;
}

function customSummary(item: CustomCartItem): string {
  const n = (a?: string[]) => (a ? a.filter(Boolean).length : 0);
  const excluded: string[] = [];
  if (n(item.excludedMainSections)) excluded.push(`${n(item.excludedMainSections)} lecture`);
  if (n(item.excludedSubSections)) excluded.push(`${n(item.excludedSubSections)} lab/tut`);
  if (n(item.excludedProfessors)) excluded.push(`${n(item.excludedProfessors)} prof`);
  if (n(item.excludedTAs)) excluded.push(`${n(item.excludedTAs)} TA`);
  const clauses: string[] = [];
  if (excluded.length) clauses.push(`${excluded.join(', ')} excluded`);
  const pref = n(item.preferredProfessors);
  if (pref) clauses.push(`${pref} preferred prof${pref > 1 ? 's' : ''}`);
  return clauses.join(' · ');
}

export function CartList({
  cart,
  onRemove,
  onClear,
  onUpdate,
  hasCustomSelection,
}: CartListProps) {
  const [customizing, setCustomizing] = useState<CustomCartItem | null>(null);

  // Keep the open dialog bound to the latest cart data as edits stream in.
  const activeItem = customizing
    ? cart.find((c) => c.courseCode === customizing.courseCode) ?? null
    : null;

  return (
    <div className="bg-[var(--lighter-dark)] rounded-xl p-5 border border-white/10 flex-1 min-w-0 flex flex-col min-h-0 max-h-[min(460px,48vh)] lg:max-h-[460px]">
      <div className="flex justify-between items-center gap-3 mb-4 shrink-0">
        <h3 className="text-[var(--light-text)] text-xl font-semibold m-0">
          Your courses
          <span className="ml-2 text-sm font-normal text-[var(--dark-text)] tabular-nums">
            {cart.length}/8
          </span>
        </h3>
        <Button
          variant="ghost"
          onClick={onClear}
          disabled={cart.length === 0}
          className="px-3 text-sm"
        >
          Clear
        </Button>
      </div>

      {cart.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-10 px-4 rounded-lg border border-dashed border-white/10">
          <i className="fas fa-cart-plus text-3xl text-[var(--dark-text)] mb-3" aria-hidden />
          <p className="text-[var(--light-text)] font-medium m-0 mb-1">No courses yet</p>
          <p className="text-[var(--dark-text)] text-sm m-0 max-w-xs">
            Search on the left and add up to 8 courses to generate schedules.
          </p>
        </div>
      ) : (
        <ul className="schedules-scroll list-none p-0 m-0 flex-1 min-h-0 overflow-y-auto flex flex-col gap-2">
          {cart.map((item) => {
            const color = courseColor(item.courseCode);
            const custom = hasCustomSelection(item);
            const summary = custom ? customSummary(item) : '';
            return (
              <li
                key={item.courseCode}
                className="flex items-center gap-3 py-2.5 px-3 rounded-lg bg-white/[0.03] border border-white/10 transition-colors hover:bg-white/[0.06]"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color.bg }}
                  aria-hidden
                />
                <div className="flex-1 min-w-0">
                  <p className="m-0 text-sm leading-snug text-[var(--light-text)] truncate">
                    <span className="font-semibold">{item.courseCode}</span>
                    <span className="text-[var(--dark-text)]"> · {item.courseName}</span>
                  </p>
                  {custom && (
                    <p className="m-0 mt-0.5 text-xs leading-snug text-[var(--card-yellow)] truncate">
                      Customized{summary ? ` · ${summary}` : ''}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setCustomizing(item)}
                  aria-label={`Customize sections for ${item.courseCode}`}
                  className={`shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-blue)] ${
                    custom ? 'text-[var(--card-yellow)]' : 'text-[var(--dark-text)] hover:text-[var(--light-text)]'
                  }`}
                >
                  <i className="fas fa-sliders-h" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(item)}
                  aria-label={`Remove ${item.courseCode} from cart`}
                  className="shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-[var(--dark-text)] transition-colors hover:text-[var(--light-text)] hover:bg-[var(--btn-danger)]/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-blue)]"
                >
                  <i className="fas fa-times" aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <CourseCustomizeDialog
        open={!!activeItem}
        item={activeItem}
        onClose={() => setCustomizing(null)}
        onUpdate={onUpdate}
      />
    </div>
  );
}
