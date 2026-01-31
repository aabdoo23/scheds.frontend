import type { CartItem } from '@/types/seatModeration';

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
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-[var(--light-text)] text-xl m-0">Monitoring Cart</h2>
        <button
          type="button"
          onClick={onClearAll}
          disabled={!isAuthenticated || cart.length === 0 || actionLoading}
          className="py-1.5 px-3 bg-transparent border border-[var(--dark-text)] text-[var(--dark-text)] rounded-md text-[0.9rem] cursor-pointer transition-colors hover:bg-[#dc3545] hover:border-[#dc3545] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {actionLoading ? <i className="fas fa-spinner fa-spin" /> : 'Clear All'}
        </button>
      </div>
      <div className="max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="text-center py-10 text-[var(--dark-text)]">
            <i className="fas fa-spinner fa-spin text-5xl mb-4 opacity-50" />
            <p className="m-0 text-base">Loading cart...</p>
          </div>
        ) : cart.length === 0 ? (
          <div className="text-center py-10 text-[var(--dark-text)]">
            <i className="fas fa-shopping-cart text-5xl mb-4 opacity-50" />
            <p className="m-0 text-base">No courses selected</p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={`${item.courseCode}-${item.section}`}
              className="flex justify-between items-center py-3 px-4 bg-[var(--dark)] rounded-md mb-2"
            >
              <div className="flex flex-col gap-1">
                <strong className="text-[var(--light-text)] text-base">{item.courseCode}</strong>
                <span className="text-[var(--dark-text)] text-[0.9rem]">
                  Section {item.section}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onRemove(item.courseCode, item.section)}
                disabled={actionLoading}
                className="py-1.5 px-2.5 bg-transparent border-none text-[var(--dark-text)] cursor-pointer rounded transition-colors hover:bg-[#dc3545] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                title="Remove"
              >
                <i className="fas fa-times" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
