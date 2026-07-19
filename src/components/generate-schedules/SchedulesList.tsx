import { useMemo, useState } from 'react';
import type { ScheduleCardItem } from '@/types/generate';
import { Button } from '@/components/ui/Button';
import { ScheduleCanvas } from './ScheduleCanvas';
import { ScheduleRankList } from './ScheduleRankList';
import { buildICS, sectionsText } from '@/lib/scheduleExport';
import {
  normalizeSchedule,
  scheduleMetrics,
  rankOrder,
  formatClock,
  formatDays,
  formatGap,
  type SortKey,
} from '@/lib/scheduleView';

interface SchedulesListProps {
  schedules: ScheduleCardItem[][];
}

export function SchedulesList({ schedules }: SchedulesListProps) {
  const [sortKey, setSortKey] = useState<SortKey>('fewestDays');
  const [selected, setSelected] = useState<number | null>(null);

  const normalized = useMemo(
    () => schedules.map((s) => normalizeSchedule(s)),
    [schedules]
  );
  const metrics = useMemo(() => normalized.map(scheduleMetrics), [normalized]);
  const order = useMemo(() => rankOrder(metrics, sortKey), [metrics, sortKey]);

  if (schedules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl bg-[var(--lighter-dark)] border border-white/10 text-center">
        <i className="fas fa-search text-4xl text-[var(--dark-text)] mb-4" aria-hidden />
        <h3 className="text-[var(--light-text)] text-xl font-semibold m-0 mb-2">
          No schedules match your preferences
        </h3>
        <p className="text-[var(--dark-text)] m-0 max-w-md">
          Try adjusting the customization options above (days, time slots, etc.) and generate again.
        </p>
      </div>
    );
  }

  const active =
    selected !== null && order.includes(selected) ? selected : order[0];
  const activeRank = order.indexOf(active) + 1;
  const m = metrics[active];

  const activeLabel = schedules.length > 1 ? `Schedule #${activeRank}` : 'Your schedule';

  const canvasHeader = (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 mb-4">
      <div className="min-w-0">
        <h3 className="text-[var(--light-text)] text-lg font-semibold m-0">{activeLabel}</h3>
        <p className="text-[var(--dark-text)] text-sm m-0 mt-0.5">
          <span className="text-[var(--light-text)] font-medium">{formatDays(m.daysOnCampus)}</span>
          {' · '}
          {formatGap(m.gapMinutes)}
          {' · '}
          <span className="tabular-nums">
            {formatClock(m.earliestStart)}–{formatClock(m.latestEnd)}
          </span>
        </p>
      </div>
      <ScheduleActions items={normalized[active]} label={activeLabel} />
    </div>
  );

  if (schedules.length === 1) {
    return (
      <div>
        {canvasHeader}
        <ScheduleCanvas items={normalized[active]} />
      </div>
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)] xl:items-start">
      <ScheduleRankList
        schedules={normalized}
        metrics={metrics}
        order={order}
        selected={active}
        onSelect={setSelected}
        sortKey={sortKey}
        onSortChange={setSortKey}
      />
      <div className="rounded-xl bg-[var(--lighter-dark)] border border-white/10 p-4 sm:p-5 min-w-0">
        {canvasHeader}
        <ScheduleCanvas items={normalized[active]} />
      </div>
    </div>
  );
}

function ScheduleActions({ items, label }: { items: ScheduleCardItem[]; label: string }) {
  const [copied, setCopied] = useState(false);

  const exportICS = () => {
    const blob = new Blob([buildICS(items, `Scheds — ${label}`)], {
      type: 'text/calendar;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${label.replace(/[^\w]+/g, '-').toLowerCase()}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const copySections = async () => {
    try {
      await navigator.clipboard.writeText(sectionsText(items));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — silently no-op
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="secondary" onClick={copySections} className="px-3 py-2 text-sm">
        <i className={`fas ${copied ? 'fa-check' : 'fa-copy'} mr-2`} aria-hidden />
        {copied ? 'Copied' : 'Copy sections'}
      </Button>
      <Button variant="secondary" onClick={exportICS} className="px-3 py-2 text-sm">
        <i className="fas fa-download mr-2" aria-hidden />
        Export .ics
      </Button>
    </div>
  );
}
