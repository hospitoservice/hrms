/**
 * AttendanceService
 *
 * Makes REST calls to the EMPLOYEE microservice to fetch attendance data
 * and maps the API response to the internal AttendanceData shape consumed
 * by Attendance.tsx.
 *
 * Base URL is read from the VITE_EMPLOYEE_SERVICE_URL environment variable —
 * the same variable shared by all services in this app.
 * Set it in a .env file:
 *   VITE_EMPLOYEE_SERVICE_URL=http://localhost:8080/api
 *
 * ─── Endpoint ─────────────────────────────────────────────────────────────────
 *
 *  GET /employees/{staffId}/attendance?month={month}&year={year}
 *
 *  Query params are optional — when omitted the service returns the current
 *  month's records.
 *
 *  Expected response shape:
 *  {
 *    month   : string          // ISO month "2023-10"  OR display "October 2023"
 *    stats   : {
 *      shiftsWorked : number   // 18
 *      shiftsMissed : number   // 1
 *      onLeave      : number   // 2
 *      totalHours   : number   // 144.5  (decimal hours)
 *    }
 *    records : [
 *      {
 *        date        : string  // ISO date  "2023-10-18"
 *        shiftType   : string  // "Day Shift" | "Night Shift" | "day" | "night" | "evening"
 *        startTime   : string  // "07:00"  or "07:00 AM"  (24-h and 12-h both accepted)
 *        endTime     : string  // "19:00"  or "07:00 PM"
 *        status      : string  // see STATUS_THEME_MAP below for accepted values
 *        hoursWorked : number  // 8.033  — decimal hours, converted to "8h 2m"
 *      }
 *    ]
 *  }
 */

import httpClient from './httpClient.js';

const BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_EMPLOYEE_SERVICE_URL) ||
  '/api';

/**
 * Maps an API status string to the three Tailwind classes used in the
 * daily record card (date-box background, date-box text, status label text).
 *
 * Keys are lower-cased + underscored at map time so both "On Time" and
 * "on_time" resolve correctly.
 */
const STATUS_THEME_MAP = {
  present:       { dateBoxBg: 'bg-green-100 dark:bg-green-900/30', dateBoxText: 'text-green-700 dark:text-green-400', statusColor: 'text-green-600' },
  on_time:       { dateBoxBg: 'bg-green-100 dark:bg-green-900/30', dateBoxText: 'text-green-700 dark:text-green-400', statusColor: 'text-green-600' },
  absent:        { dateBoxBg: 'bg-red-100 dark:bg-red-900/30',     dateBoxText: 'text-red-700 dark:text-red-400',     statusColor: 'text-red-600'   },
  missed:        { dateBoxBg: 'bg-red-100 dark:bg-red-900/30',     dateBoxText: 'text-red-700 dark:text-red-400',     statusColor: 'text-red-600'   },
  leave:         { dateBoxBg: 'bg-blue-100 dark:bg-blue-900/30',   dateBoxText: 'text-blue-700 dark:text-blue-400',   statusColor: 'text-blue-500'  },
  medical_leave: { dateBoxBg: 'bg-blue-100 dark:bg-blue-900/30',   dateBoxText: 'text-blue-700 dark:text-blue-400',   statusColor: 'text-blue-500'  },
  annual_leave:  { dateBoxBg: 'bg-blue-100 dark:bg-blue-900/30',   dateBoxText: 'text-blue-700 dark:text-blue-400',   statusColor: 'text-blue-500'  },
  duty_leave:    { dateBoxBg: 'bg-blue-100 dark:bg-blue-900/30',   dateBoxText: 'text-blue-700 dark:text-blue-400',   statusColor: 'text-blue-500'  },
};

/** Fallback theme when status is absent or unrecognised. */
const DEFAULT_THEME = {
  dateBoxBg:   'bg-gray-100 dark:bg-gray-800',
  dateBoxText: 'text-gray-600 dark:text-gray-400',
  statusColor: 'text-gray-500',
};

/** Maps raw shiftType tokens to a display-friendly shift name. */
const SHIFT_NAME_MAP = {
  day:     'Day Shift',
  night:   'Night Shift',
  evening: 'Evening Shift',
  morning: 'Morning Shift',
};

class AttendanceService {
  /**
   * @param {string} [baseUrl] - Override the microservice base URL (useful in tests).
   */
  constructor(baseUrl = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /**
   * Fetches attendance records for a staff member.
   *
   * @param {string}  staffId        - The employee's staff / employee ID.
   * @param {number}  [month]        - 1-based month number (1 = January). Defaults to current month.
   * @param {number}  [year]         - 4-digit year. Defaults to current year.
   * @returns {Promise<AttendanceData>} Normalised attendance data.
   * @throws {Error} When the network request fails or the server returns a
   *                 non-2xx status code.
   */
  async getAttendance(staffId, month, year) {
    const now          = new Date();
    const resolvedMonth = month ?? now.getMonth() + 1; // getMonth() is 0-based
    const resolvedYear  = year  ?? now.getFullYear();

    const params = new URLSearchParams({
      month: String(resolvedMonth),
      year:  String(resolvedYear),
    });

    const url = `${this.baseUrl}/employees/${encodeURIComponent(staffId)}/attendance?${params}`;

    const response = await httpClient.get(url);

    if (!response.ok) {
      throw new Error(
        `AttendanceService.getAttendance failed — HTTP ${response.status} for staffId "${staffId}"`
      );
    }

    const raw = await response.json();
    return this._mapToAttendanceData(raw);
  }

  // ─── Private mappers ───────────────────────────────────────────────────────

  /**
   * Normalises the raw API payload to the internal AttendanceData shape.
   *
   * @param {Object} raw
   * @returns {AttendanceData}
   */
  _mapToAttendanceData(raw) {
    const rawRecords = raw.records || raw.dailyRecords || raw.attendance || [];

    return {
      currentMonth: this._formatMonthYear(raw.month) || raw.month || '',
      stats:        this._mapStats(raw.stats || {}),
      dailyRecords: rawRecords.map((r) => this._mapRecord(r)),
    };
  }

  /**
   * Converts the stats object from the API into the four-item display array.
   *
   * @param {Object} s - Raw stats block.
   * @returns {StatItem[]}
   */
  _mapStats(s) {
    const worked = s.shiftsWorked ?? s.totalShifts    ?? s.present  ?? 0;
    const missed = s.shiftsMissed ?? s.missedShifts   ?? s.absent   ?? 0;
    const onLeave= s.onLeave      ?? s.leaveCount     ?? s.leaves   ?? 0;
    const hours  = s.totalHours   ?? s.hoursWorked    ?? 0;

    return [
      {
        label: 'Shifts Worked',
        value: String(worked),
        color: 'text-green-600',
      },
      {
        label: 'Shifts Missed',
        value: String(missed),
        color: 'text-red-600',
      },
      {
        label: 'On Leave',
        value: String(onLeave),
        color: 'text-blue-500',
      },
      {
        label: 'Total Hours',
        value: this._formatTotalHours(hours),
        color: 'text-text-main-light dark:text-text-main-dark',
      },
    ];
  }

  /**
   * Normalises a single daily attendance record.
   *
   * @param {Object} r - Raw record from the API.
   * @returns {DailyRecord}
   */
  _mapRecord(r) {
    // Resolve the ISO date string (e.g. "2023-10-18").
    const isoDate = r.date || r.attendanceDate || r.shiftDate || '';

    // Derive the three-letter day name and numeric date from the ISO string.
    const { dayLabel, dateNum } = this._parseDateParts(isoDate);

    // Resolve and normalise the shift name.
    const shiftName = this._resolveShiftName(r.shiftType || r.shiftName || r.shift || '');

    // Build "HH:MM AM - HH:MM PM" from separate start/end fields or a combined range.
    const shiftTime = this._resolveShiftTime(r);

    // Map status string → display label + Tailwind classes.
    const statusKey  = (r.status || '').toLowerCase().replace(/[\s-]+/g, '_');
    const theme      = STATUS_THEME_MAP[statusKey] || DEFAULT_THEME;
    const statusLabel = this._resolveStatusLabel(r.status || '');

    // Format decimal hours → "8h 2m".
    const duration = r.hoursWorked != null ? this._formatHoursWorked(r.hoursWorked) : (r.duration || '');

    return {
      dayLabel:    dayLabel,
      date:        dateNum,
      shiftName:   shiftName,
      shiftTime:   shiftTime,
      status:      statusLabel,
      duration:    duration,
      dateBoxBg:   theme.dateBoxBg,
      dateBoxText: theme.dateBoxText,
      statusColor: theme.statusColor,
    };
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  /**
   * Extracts the short weekday label ("Wed") and numeric day ("18") from
   * an ISO date string.
   *
   * @param {string} isoDate  e.g. "2023-10-18"
   * @returns {{ dayLabel: string, dateNum: string }}
   */
  _parseDateParts(isoDate) {
    if (!isoDate) return { dayLabel: '', dateNum: '' };
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return { dayLabel: '', dateNum: isoDate };
    const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' }); // "Wed"
    const dateNum  = String(date.getDate());                                  // "18"
    return { dayLabel, dateNum };
  }

  /**
   * Resolves a raw shiftType token to a display-friendly name.
   * Passes through already-formatted strings like "Day Shift" unchanged.
   *
   * @param {string} raw
   * @returns {string}
   */
  _resolveShiftName(raw) {
    if (!raw) return '';
    const key = raw.toLowerCase().trim();
    return SHIFT_NAME_MAP[key] || raw; // return as-is if already formatted
  }

  /**
   * Builds the shift time range string ("07:00 AM - 07:00 PM") from whatever
   * combination of fields the API provides.
   *
   * Accepted API fields (in priority order):
   *   1. r.shiftTime  — pre-formatted string, used directly
   *   2. r.startTime + r.endTime — separate strings, formatted and joined
   *
   * @param {Object} r - Raw record.
   * @returns {string}
   */
  _resolveShiftTime(r) {
    if (r.shiftTime) return r.shiftTime;
    if (r.startTime && r.endTime) {
      return `${this._formatTime(r.startTime)} - ${this._formatTime(r.endTime)}`;
    }
    return '';
  }

  /**
   * Converts a status token into a human-readable display label.
   * Already-readable strings (e.g. "On Time", "Medical Leave") pass through.
   *
   * @param {string} raw
   * @returns {string}
   */
  _resolveStatusLabel(raw) {
    if (!raw) return '';
    // Convert snake_case / kebab-case → Title Case.
    return raw
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  /**
   * Converts an ISO month string ("2023-10") or ISO date ("2023-10-18") to
   * "Month YYYY" display format ("October 2023").
   *
   * @param {string|null|undefined} raw
   * @returns {string}
   */
  _formatMonthYear(raw) {
    if (!raw) return '';
    const normalised = raw.length === 7 ? `${raw}-01` : raw;
    const date = new Date(normalised);
    if (isNaN(date.getTime())) return raw;
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  /**
   * Converts decimal hours (8.033) to "8h 2m" notation.
   *
   * @param {number} decimalHours
   * @returns {string}
   */
  _formatHoursWorked(decimalHours) {
    if (!decimalHours && decimalHours !== 0) return '';
    const totalMinutes = Math.round(decimalHours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  }

  /**
   * Formats a total-hours number to a compact string ("144h").
   * Fractional hours are rounded to the nearest half-hour for display.
   *
   * @param {number} hours
   * @returns {string}
   */
  _formatTotalHours(hours) {
    if (!hours && hours !== 0) return '0h';
    return `${Math.round(hours)}h`;
  }

  /**
   * Normalises a time string to "H:MM AM/PM" display format.
   * Accepts "07:00", "07:00:00", and already-formatted "07:00 AM".
   *
   * @param {string} timeStr
   * @returns {string}
   */
  _formatTime(timeStr) {
    if (!timeStr) return '';
    if (/[ap]m/i.test(timeStr)) return timeStr; // already formatted

    const parts = timeStr.split(':').map(Number);
    if (parts.length < 2 || parts.some(isNaN)) return timeStr;

    const [hours, minutes] = parts;
    const period = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    const m = String(minutes).padStart(2, '0');
    return `${h}:${m} ${period}`;
  }
}

/**
 * @typedef {Object} StatItem
 * @property {string} label
 * @property {string} value
 * @property {string} color  - Tailwind text colour class
 */

/**
 * @typedef {Object} DailyRecord
 * @property {string} dayLabel    - e.g. "Wed"
 * @property {string} date        - Numeric day  e.g. "18"
 * @property {string} shiftName   - e.g. "Day Shift"
 * @property {string} shiftTime   - e.g. "07:00 AM - 07:00 PM"
 * @property {string} status      - Display label  e.g. "On Time"
 * @property {string} duration    - e.g. "8h 2m"  (empty string when absent/leave)
 * @property {string} dateBoxBg   - Tailwind bg class
 * @property {string} dateBoxText - Tailwind text class
 * @property {string} statusColor - Tailwind text class for the status label
 */

/**
 * @typedef {Object} AttendanceData
 * @property {string}        currentMonth
 * @property {StatItem[]}    stats
 * @property {DailyRecord[]} dailyRecords
 */

// Export as a singleton — one shared instance across the app.
export default new AttendanceService();
