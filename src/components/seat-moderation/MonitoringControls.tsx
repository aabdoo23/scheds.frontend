interface MonitoringControlsProps {
  isMonitoring: boolean;
  statusText: string;
  onStart: () => void;
  onStop: () => void;
  cartEmpty: boolean;
  isAuthenticated: boolean;
}

export function MonitoringControls({
  isMonitoring,
  statusText,
  onStart,
  onStop,
  cartEmpty,
  isAuthenticated,
}: MonitoringControlsProps) {
  return (
    <div className="bg-[var(--lighter-dark)] rounded-xl p-6 mb-5 border border-white/10">
      <h2 className="text-[var(--light-text)] text-xl m-0 mb-5">Controls</h2>
      <div className="flex gap-2.5 mb-4">
        {!isMonitoring ? (
          <button
            type="button"
            onClick={onStart}
            disabled={!isAuthenticated || cartEmpty}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-[var(--light-blue)] border-none cursor-pointer transition-colors hover:bg-[var(--dark-blue)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fas fa-play" />
            Start Monitoring
          </button>
        ) : (
          <button
            type="button"
            onClick={onStop}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-[#dc3545] border-none cursor-pointer transition-colors hover:bg-[#c82333]"
          >
            <i className="fas fa-stop" />
            Stop Monitoring
          </button>
        )}
      </div>
      <div
        className={`py-2.5 px-4 rounded-md text-center text-[0.95rem] ${
          isMonitoring
            ? 'bg-white/5 text-[#28a745] font-semibold'
            : 'bg-white/5 text-[#6c757d]'
        }`}
      >
        {statusText}
      </div>
    </div>
  );
}
