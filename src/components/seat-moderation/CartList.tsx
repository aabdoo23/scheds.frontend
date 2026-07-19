import type { CartItem } from '@/types/seatModeration';
import { Button } from '@/components/ui/Button';

interface CartListProps {
  cart: CartItem[];
  onRemove: (courseCode: string, section: string) => void;
  onClearAll: () => void;
  isAuthenticated: boolean;
  loading?: boolean;
  actionLoading?: boolean;
}

export function CartList({ cart, onRemove, onClearAll, isAuthenticated, loading, actionLoading }: CartListProps) {
  return (
    <div className="bg-[var(--lighter-dark)] rounded-xl p-6 mb-5 border border-white/10">
      <div className="flex justify-between items-center gap-3 mb-5">
        <h2 className="text-[var(--light-text)] text-xl font-semibold m-0">Monitoring cart</h2>
        <Button
          variant="ghost"
          onClick={onClearAll}
          disabled={!isAuthenticated || cart.length === 0 || actionLoading}
          className="px-3 text-sm"
        >
          {actionLoading ? <i className="fas fa-circle-notch fa-spin" aria-hidden /> : 'Clear all'}
        </Button>
      </div>
      <div className="max-h-[400px] overflow-y-auto schedules-scroll">
        {loading ? (
          <div className="text-center py-10 text-[var(--dark-text)]">
            <i className="fas fa-circle-notch fa-spin text-3xl mb-3" aria-hidden />
            <p className="m-0 text-sm">Loading cart&hellip;</p>
          </div>
        ) : cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-10 px-4 rounded-lg border border-dashed border-white/10">
            <i className="fas fa-cart-shopping text-3xl text-[var(--dark-text)] mb-3" aria-hidden />
            <p className="text-[var(--light-text)] font-medium m-0 mb-1">No courses selected</p>
            <p className="text-[var(--dark-text)] text-sm m-0">
              Search above and add a section to start monitoring it.
            </p>
          </div>
        ) : (
          <ul className="list-none p-0 m-0 flex flex-col gap-2">
            {cart.map((item) => (
              <li
                key={`${item.courseCode}-${item.section}`}
                className="flex justify-between items-center gap-3 py-2.5 px-3 bg-white/[0.03] border border-white/10 rounded-lg"
              >
                <div className="flex flex-col min-w-0">
                  <strong className="text-[var(--light-text)] text-sm">{item.courseCode}</strong>
                  <span className="text-[var(--dark-text)] text-xs">Section {item.section}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(item.courseCode, item.section)}
                  disabled={actionLoading}
                  aria-label={`Remove ${item.courseCode} section ${item.section}`}
                  className="shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-[var(--dark-text)] transition-colors hover:text-[var(--light-text)] hover:bg-[var(--btn-danger)]/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--light-blue)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fas fa-times" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
