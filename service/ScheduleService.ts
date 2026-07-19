/**
 * ScheduleService
 *
 * Fetches employee weekly schedules from the employee-service.
 * The Vite proxy routes /api → http://employee-service:8082
 *
 * Endpoint used:
 *   GET /api/employees/{staffId}/schedule?week=YYYY-MM-DD
 *   Returns ScheduleResponseDTO (or 404 when no schedule exists for that week)
 *
 * Uses httpClient so the JWT Bearer token is attached automatically —
 * the employee-service requires authentication on all schedule endpoints.
 */

import httpClient from './httpClient.js';

const BASE_URL = '/api';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface TimeSlot {
  slotId: string;
  startTime: string;   // "HH:MM:SS" from LocalTime scalar
  endTime: string;
  status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED';
  employeeId?: string;
  patientId?: string;
  appointmentId?: string;
}

export interface DaySchedule {
  date: string;        // "YYYY-MM-DD"
  dayOfWeek?: string;
  workingDay: boolean;
  timeSlots: TimeSlot[];
}

export interface WeekSchedule {
  scheduleId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  weekStartDate: string;
  weekEndDate: string;
  days: DaySchedule[];
  createdBy?: string;
  updatedAt?: string;
}

// ── Service ────────────────────────────────────────────────────────────────────

const ScheduleService = {

  async getScheduleForWeek(staffId: string, weekDate: string): Promise<WeekSchedule | null> {
    const res = await httpClient.get(
      `${BASE_URL}/employees/${encodeURIComponent(staffId)}/schedule?week=${weekDate}`
    );
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`ScheduleService: HTTP ${res.status}`);
    return res.json() as Promise<WeekSchedule>;
  },

  /** Returns ISO date string (YYYY-MM-DD) for the Monday of the week containing `date`. */
  getMondayOfWeek(date: Date): string {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    return d.toISOString().split('T')[0];
  },

  /** Returns an array of 7 ISO date strings Mon–Sun for the given Monday. */
  getWeekDates(mondayStr: string): string[] {
    const monday = new Date(mondayStr + 'T00:00:00');
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.toISOString().split('T')[0];
    });
  },

  /** "HH:MM:SS" → "H:MM AM/PM" */
  formatTime(timeStr?: string): string {
    if (!timeStr) return '';
    if (/[ap]m/i.test(timeStr)) return timeStr;
    const parts = timeStr.split(':').map(Number);
    if (parts.length < 2 || parts.some(isNaN)) return timeStr;
    const [hours, minutes] = parts;
    const period = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    const m = String(minutes).padStart(2, '0');
    return `${h}:${m} ${period}`;
  },

  /** "YYYY-MM-DD" → "Jun 9" */
  formatShortDate(isoDate: string): string {
    const d = new Date(isoDate + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  },

  /** "YYYY-MM-DD" → "June 9 – June 15, 2026" */
  formatWeekRange(mondayStr: string): string {
    const dates = ScheduleService.getWeekDates(mondayStr);
    const start = new Date(dates[0] + 'T00:00:00');
    const end   = new Date(dates[6] + 'T00:00:00');
    const opts: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' };
    return `${start.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`;
  },
};

export default ScheduleService;
