import { useState, useCallback, useRef, useEffect } from 'react';
import type { ScheduleCardItem } from '@/types/generate';
import { formatTimeHHMM } from '@/lib/scheduleUtils';

interface ScheduleCardWithDetailProps {
  item: ScheduleCardItem;
  compact?: boolean;
  cardKey: string;
  isActive: boolean;
  onActivate: (key: string, byClick: boolean) => void;
  onDeactivate: () => void;
}

export function ScheduleCardWithDetail({
  item,
  compact,
  cardKey,
  isActive,
  onActivate,
  onDeactivate,
}: ScheduleCardWithDetailProps) {
  const [openedByClick, setOpenedByClick] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const expanded = isActive;

  const handleMouseEnter = useCallback(() => {
    onActivate(cardKey, false);
    setOpenedByClick(false);
  }, [cardKey, onActivate]);

  const handleMouseLeave = useCallback(() => {
    if (!openedByClick) {
      onDeactivate();
    }
  }, [openedByClick, onDeactivate]);

  const handleClick = useCallback(() => {
    if (isActive) {
      onDeactivate();
      setOpenedByClick(false);
    } else {
      onActivate(cardKey, true);
      setOpenedByClick(true);
    }
  }, [isActive, cardKey, onActivate, onDeactivate]);

  useEffect(() => {
    if (!isActive || !openedByClick) return;
    const handleClickOutside = (e: MouseEvent) => {
      const wrapper = wrapperRef.current;
      const target = e.target as Node;
      if (wrapper && !wrapper.contains(target)) {
        onDeactivate();
        setOpenedByClick(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onDeactivate();
        setOpenedByClick(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isActive, openedByClick, onDeactivate]);

  return (
    <>
      {openedByClick && expanded && (
        <div
          role="button"
          tabIndex={-1}
          aria-label="Tap to close"
          className="fixed inset-0 z-40 bg-black/10"
          onClick={() => {
            onDeactivate();
            setOpenedByClick(false);
          }}
        />
      )}
      <div
        ref={wrapperRef}
        className={`relative w-full min-w-[8rem] ${openedByClick && expanded ? 'z-50' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <article
          onClick={handleClick}
          className="flex flex-col w-full rounded-xl overflow-hidden shadow transition-all duration-300 hover:shadow-lg focus-within:ring-2 focus-within:ring-[var(--light-blue)] focus-within:ring-offset-2 focus-within:ring-offset-[var(--lighter-dark)] cursor-pointer bg-[var(--lighter-dark)] text-[var(--light-text)]"
          aria-expanded={expanded}
          aria-label={`${item.courseCode} ${item.courseName}, ${item.subType} ${item.section}. ${expanded ? 'Expanded' : 'Tap to view details'}.`}
        >
          {/* Top section: emerges from behind - Seats Left, Credits */}
          <div
            className="grid transition-[grid-template-rows] duration-300 ease-out"
            style={{ gridTemplateRows: expanded ? '1fr' : '0fr' }}
          >
            <div className="overflow-hidden">
              <div className="py-2 px-3 border-b border-[var(--lightest-dark)]/50 bg-[var(--lighter-dark)]">
                <div className="flex flex-col gap-0.5 text-sm">
                  <span className="font-bold">Seats Left: {item.seatsLeft}</span>
                  <span className="font-medium">Credits: {item.credits} CH</span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle section: always visible - Course code, name, instructor */}
          <div className="flex flex-col gap-0.5 px-3 py-2.5 min-h-[48px] shrink-0 bg-[var(--lighter)]">
            <div
              className={`font-bold overflow-hidden text-ellipsis leading-tight text-[var(--light-text)] ${
                compact ? 'text-[0.85em] line-clamp-1' : 'text-[0.9em] line-clamp-2'
              }`}
            >
              {item.courseCode}: {item.courseName}
            </div>
            <span className="text-[0.8em] font-medium text-[var(--dark-text)]">{item.instructorName}</span>
          </div>

          {/* Bottom section: emerges from behind - Room, Time */}
          <div
            className="grid transition-[grid-template-rows] duration-300 ease-out"
            style={{ gridTemplateRows: expanded ? '1fr' : '0fr' }}
          >
            <div className="overflow-hidden">
              <div className="py-2 px-3 border-t border-[var(--lightest-dark)]/50 bg-[var(--lighter-dark)]">
                <div className="flex flex-col gap-1 text-[0.85em]">
                  {item.day ? (
                    <>
                      <div className="flex items-start gap-2 font-semibold">
                        <i className="fa-regular fa-clock mt-0.5 shrink-0" aria-hidden />
                        <span>
                          {item.day}, {formatTimeHHMM(item.startTime)} - {formatTimeHHMM(item.endTime)}
                        </span>
                      </div>
                      <div className="font-bold">Room: {item.room}</div>
                    </>
                  ) : (
                    <span className="text-[var(--dark-text)]">No schedule</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer: always visible */}
          <div className="flex justify-center items-center py-2 px-3 bg-[var(--light-blue)] text-white font-semibold text-sm min-h-[44px] shrink-0">
            {item.subType} - {item.section}
          </div>
        </article>
      </div>
    </>
  );
}
