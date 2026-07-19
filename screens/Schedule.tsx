import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../service/AuthService.js';
import ScheduleService, { WeekSchedule, DaySchedule, TimeSlot } from '../service/ScheduleService';

// ── Constants ──────────────────────────────────────────────────────────────────

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const SLOT_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  AVAILABLE: { bg: 'bg-blue-50  dark:bg-blue-900/20',  text: 'text-blue-700  dark:text-blue-300',  dot: 'bg-blue-500'  },
  BOOKED:    { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
  BLOCKED:   { bg: 'bg-red-50   dark:bg-red-900/20',   text: 'text-red-700   dark:text-red-300',   dot: 'bg-red-500'   },
};

// ── Sub-components ─────────────────────────────────────────────────────────────

const SlotCard: React.FC<{ slot: TimeSlot }> = ({ slot }) => {
  const s = SLOT_STYLES[slot.status] ?? SLOT_STYLES.AVAILABLE;
  return (
    <div className={`flex items-center gap-2.5 rounded-lg px-3 py-2 ${s.bg}`}>
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-bold ${s.text}`}>
          {ScheduleService.formatTime(slot.startTime)} – {ScheduleService.formatTime(slot.endTime)}
        </p>
        {slot.status === 'BOOKED' && slot.patientId && (
          <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5 truncate">
            Patient: {slot.patientId}
          </p>
        )}
        {slot.status === 'BLOCKED' && (
          <p className="text-[10px] text-red-500 dark:text-red-400 mt-0.5">Blocked</p>
        )}
      </div>
      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${s.bg} ${s.text} border border-current/20 flex-shrink-0`}>
        {slot.status}
      </span>
    </div>
  );
};

const DayCard: React.FC<{ daySchedule: DaySchedule | null; dateStr: string; label: string; isToday: boolean }> = ({
  daySchedule, dateStr, label, isToday,
}) => {
  const [expanded, setExpanded] = useState(isToday);

  const hasSlots  = (daySchedule?.timeSlots?.length ?? 0) > 0;
  const isWorking = daySchedule?.workingDay ?? false;

  const availableCount = daySchedule?.timeSlots?.filter(s => s.status === 'AVAILABLE').length ?? 0;
  const bookedCount    = daySchedule?.timeSlots?.filter(s => s.status === 'BOOKED').length    ?? 0;

  return (
    <div className={`rounded-xl border shadow-sm overflow-hidden ${
      isToday
        ? 'border-secondary bg-white dark:bg-card-dark'
        : 'border-gray-200 dark:border-border-dark bg-white dark:bg-card-dark'
    }`}>
      {/* Day header row */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        onClick={() => setExpanded(o => !o)}
      >
        <div className="flex items-center gap-3">
          <div className={`flex flex-col items-center w-10 rounded-lg py-1 ${
            isToday ? 'bg-secondary text-white' : 'bg-gray-100 dark:bg-gray-800'
          }`}>
            <span className={`text-[10px] font-bold uppercase ${isToday ? 'text-white/80' : 'text-text-sub-light dark:text-text-sub-dark'}`}>
              {label}
            </span>
            <span className={`text-base font-bold leading-none ${isToday ? 'text-white' : 'text-text-main-light dark:text-text-main-dark'}`}>
              {new Date(dateStr + 'T00:00:00').getDate()}
            </span>
          </div>
          <div>
            {!daySchedule && (
              <span className="text-xs text-text-sub-light dark:text-text-sub-dark">No schedule set</span>
            )}
            {daySchedule && !isWorking && (
              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">Day Off</span>
            )}
            {isWorking && (
              <div className="flex items-center gap-2">
                {availableCount > 0 && (
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                    {availableCount} open
                  </span>
                )}
                {bookedCount > 0 && (
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                    {bookedCount} booked
                  </span>
                )}
                {!hasSlots && (
                  <span className="text-xs text-text-sub-light dark:text-text-sub-dark">Working — no slots</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isToday && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-secondary/10 text-secondary">
              Today
            </span>
          )}
          {(daySchedule && isWorking) && (
            <span className={`material-symbols-outlined text-gray-400 text-lg transition-transform ${expanded ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          )}
        </div>
      </button>

      {/* Expanded slot list */}
      {expanded && isWorking && hasSlots && (
        <div className="px-4 pb-4 flex flex-col gap-2 border-t border-gray-100 dark:border-gray-800 pt-3">
          {daySchedule!.timeSlots.map(slot => (
            <SlotCard key={slot.slotId} slot={slot} />
          ))}
        </div>
      )}
    </div>
  );
};

// ── Summary stats ──────────────────────────────────────────────────────────────

const WeekStats: React.FC<{ schedule: WeekSchedule }> = ({ schedule }) => {
  const workingDays  = schedule.days.filter(d => d.workingDay).length;
  const totalSlots   = schedule.days.flatMap(d => d.timeSlots).length;
  const bookedSlots  = schedule.days.flatMap(d => d.timeSlots).filter(s => s.status === 'BOOKED').length;

  return (
    <div className="grid grid-cols-3 gap-3 mb-4">
      {[
        { label: 'Working Days', value: String(workingDays), color: 'text-secondary' },
        { label: 'Total Slots',  value: String(totalSlots),  color: 'text-text-main-light dark:text-text-main-dark' },
        { label: 'Booked',       value: String(bookedSlots), color: 'text-amber-600 dark:text-amber-400' },
      ].map(stat => (
        <div key={stat.label} className="bg-white dark:bg-card-dark rounded-xl border border-gray-100 dark:border-border-dark p-3 text-center shadow-sm">
          <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
          <p className="text-[10px] text-text-sub-light dark:text-text-sub-dark font-medium mt-0.5">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

// ── Main screen ────────────────────────────────────────────────────────────────

const Schedule: React.FC = () => {
  const navigate  = useNavigate();
  const staffId   = AuthService.getEmployeeId();

  const todayISO  = new Date().toISOString().split('T')[0];
  const [weekStart, setWeekStart] = useState<string>(
    () => ScheduleService.getMondayOfWeek(new Date())
  );
  const weekDates = ScheduleService.getWeekDates(weekStart);

  const [schedule, setSchedule]  = useState<WeekSchedule | null>(null);
  const [loading,  setLoading]   = useState(true);
  const [error,    setError]     = useState('');

  const fetchSchedule = useCallback(async (wk: string) => {
    if (!staffId) { setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      const data = await ScheduleService.getScheduleForWeek(staffId, wk);
      setSchedule(data);
    } catch {
      setError('Failed to load schedule. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [staffId]);

  useEffect(() => { fetchSchedule(weekStart); }, [weekStart, fetchSchedule]);

  const prevWeek = () => {
    const d = new Date(weekStart + 'T00:00:00');
    d.setDate(d.getDate() - 7);
    setWeekStart(d.toISOString().split('T')[0]);
  };
  const nextWeek = () => {
    const d = new Date(weekStart + 'T00:00:00');
    d.setDate(d.getDate() + 7);
    setWeekStart(d.toISOString().split('T')[0]);
  };
  const goToThisWeek = () => setWeekStart(ScheduleService.getMondayOfWeek(new Date()));

  // Build a map of date → DaySchedule for O(1) lookup
  const dayMap: Record<string, DaySchedule> = {};
  schedule?.days?.forEach(d => { dayMap[d.date] = d; });

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24">

      {/* ── Sticky header ─────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 flex items-center justify-center text-text-main-light dark:text-text-main-dark"
          >
            <span className="material-symbols-outlined text-2xl">pending_actions</span>
          </button>

          <div className="text-center">
            <h1 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">My Schedule</h1>
            <p className="text-xs text-text-sub-light dark:text-text-sub-dark">
              {ScheduleService.formatWeekRange(weekStart)}
            </p>
          </div>

          <button
            onClick={() => fetchSchedule(weekStart)}
            className="w-10 h-10 flex items-center justify-center text-text-sub-light dark:text-text-sub-dark"
            disabled={loading}
          >
            <span className={`material-symbols-outlined text-xl ${loading ? 'animate-spin' : ''}`}>
              refresh
            </span>
          </button>
        </div>

        {/* Week navigation */}
        <div className="flex items-center justify-between px-4 pb-3 gap-2">
          <button
            onClick={prevWeek}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-border-dark bg-white dark:bg-card-dark active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined text-lg text-text-main-light dark:text-text-main-dark">chevron_left</span>
          </button>

          <button
            onClick={goToThisWeek}
            className="flex-1 h-9 rounded-lg text-xs font-bold bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark text-secondary active:scale-95 transition-transform"
          >
            This Week
          </button>

          <button
            onClick={nextWeek}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-border-dark bg-white dark:bg-card-dark active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined text-lg text-text-main-light dark:text-text-main-dark">chevron_right</span>
          </button>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 p-4">

        {/* No staff ID */}
        {!staffId && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-3">badge</span>
            <p className="text-sm text-text-sub-light dark:text-text-sub-dark font-medium">
              Employee profile not linked. Contact your admin.
            </p>
          </div>
        )}

        {/* Loading */}
        {staffId && loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-secondary animate-spin" />
            <p className="text-sm text-text-sub-light dark:text-text-sub-dark">Loading schedule…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-center">
            <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
          </div>
        )}

        {/* No schedule for this week */}
        {staffId && !loading && !error && !schedule && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-3">event_busy</span>
            <h5 className="font-bold text-text-main-light dark:text-text-main-dark mb-1">No schedule for this week</h5>
            <p className="text-sm text-text-sub-light dark:text-text-sub-dark">
              Your admin hasn't created a schedule for this period yet.
            </p>
          </div>
        )}

        {/* Schedule loaded */}
        {!loading && !error && schedule && (
          <>
            <WeekStats schedule={schedule} />

            {/* Slot legend */}
            <div className="flex items-center gap-4 mb-4">
              {Object.entries(SLOT_STYLES).map(([status, s]) => (
                <div key={status} className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${s.dot}`} />
                  <span className="text-[10px] font-medium text-text-sub-light dark:text-text-sub-dark capitalize">
                    {status.charAt(0) + status.slice(1).toLowerCase()}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              {weekDates.map((dateStr, idx) => (
                <DayCard
                  key={dateStr}
                  dateStr={dateStr}
                  label={DAY_LABELS[idx]}
                  daySchedule={dayMap[dateStr] ?? null}
                  isToday={dateStr === todayISO}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Schedule;
