import { Button } from '@/components/ui/Button';

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
      <h2 className="text-[var(--light-text)] text-xl font-semibold m-0 mb-5">Controls</h2>
      <div className="flex gap-2.5 mb-4">
        {!isMonitoring ? (
          <Button onClick={onStart} disabled={!isAuthenticated || cartEmpty} fullWidth>
            <i className="fas fa-play mr-2" aria-hidden />
            Start monitoring
          </Button>
        ) : (
          <Button variant="danger" onClick={onStop} fullWidth>
            <i className="fas fa-stop mr-2" aria-hidden />
            Stop monitoring
          </Button>
        )}
      </div>
      <div
        role="status"
        className={`py-2.5 px-4 rounded-lg text-center text-sm bg-white/5 ${
          isMonitoring ? 'text-[var(--success)] font-semibold' : 'text-[var(--dark-text)]'
        }`}
      >
        {isMonitoring && (
          <span
            className="inline-block w-2 h-2 rounded-full bg-[var(--success)] mr-2 align-middle animate-pulse motion-reduce:animate-none"
            aria-hidden
          />
        )}
        {statusText}
      </div>
    </div>
  );
}
