/**
 * AppointmentsService
 *
 * Makes REST calls to the EMPLOYEE microservice to fetch appointment data
 * and maps the API response to the internal AppointmentsData shape consumed
 * by Appointments.tsx.
 *
 * Base URL is read from the VITE_EMPLOYEE_SERVICE_URL environment variable —
 * the same variable used by EmployeeProfile.js and PayrollService.js.
 * Set it in a .env file:
 *   VITE_EMPLOYEE_SERVICE_URL=http://localhost:8080/api
 *
 * ─── Endpoint ─────────────────────────────────────────────────────────────────
 *
 *  GET /employees/{staffId}/appointments
 *  Returns today's appointment list for the given staff member.
 *  Expected shape:
 *  {
 *    date         : string    // ISO date "2023-10-26"  OR display "October 26, 2023"
 *    appointments : [
 *      {
 *        id              : number | string   // unique appointment identifier
 *        scheduledTime   : string            // "10:30 AM"  or "10:30"  (24-h also accepted)
 *        patientName     : string            // "Adrianne Smith"
 *        contactNumber   : string            // "555-0101"  (also: phone / contact)
 *        gender          : string            // "Female"  — combined with age when present
 *        age             : number            // 34
 *        patientDetails  : string            // pre-formatted "Female, 34 yrs" (overrides gender+age)
 *        chiefComplaint  : string            // symptoms / reason for visit (also: symptoms / notes)
 *        status          : string            // "confirmed" | "pending" | "in_progress" | "completed"
 *        defaultOpen     : boolean           // optional — whether the card is expanded on load
 *      }
 *    ]
 *  }
 */


import httpClient from './httpClient.js';

const BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_EMPLOYEE_SERVICE_URL) ||
  '/api';

/** Maps an API appointment status string to a Tailwind dot-colour class. */
const STATUS_COLOR_MAP = {
  confirmed:   'bg-green-500',
  in_progress: 'bg-blue-500',
  pending:     'bg-gray-400',
  completed:   'bg-gray-300',
};

/** Fallback colour when status is absent or unrecognised. */
const DEFAULT_STATUS_COLOR = 'bg-gray-400';

class AppointmentsService {
  /**
   * @param {string} [baseUrl] - Override the microservice base URL (useful in tests).
   */
  constructor(baseUrl = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /**
   * Fetches today's appointments for a staff member from the employee microservice.
   *
   * @param {string} staffId - The employee's staff / employee ID.
   * @returns {Promise<AppointmentsData>} Normalised appointments data.
   * @throws {Error} When the network request fails or the server returns a
   *                 non-2xx status code.
   */
  async getAppointments(staffId) {
    const url = `${this.baseUrl}/employees/${encodeURIComponent(staffId)}/appointments`;

    const response = await httpClient.get(url);

    if (!response.ok) {
      throw new Error(
        `AppointmentsService.getAppointments failed — HTTP ${response.status} for staffId "${staffId}"`
      );
    }

    const raw = await response.json();
    return this._mapToAppointmentsData(raw);
  }

  // ─── Private mappers ───────────────────────────────────────────────────────

  /**
   * Normalises the raw API payload to the internal AppointmentsData shape.
   * Every field falls back gracefully so a partial API response never
   * results in undefined values in the UI.
   *
   * @param {Object} raw - Raw JSON from the employee microservice.
   * @returns {AppointmentsData}
   */
  _mapToAppointmentsData(raw) {
    const rawList = raw.appointments || raw.appointmentList || raw.data || [];

    return {
      date: this._formatAppointmentDate(raw.date) || raw.date || '',
      list: rawList.map((item, index) => this._mapAppointmentItem(item, index)),
    };
  }

  /**
   * Normalises a single appointment record.
   *
   * @param {Object} item  - Raw appointment object from the API.
   * @param {number} index - Array index, used to set defaultOpen on the first item
   *                         when the API does not specify it.
   * @returns {AppointmentItem}
   */
  _mapAppointmentItem(item, index) {
    // Build patientDetails string from separate gender + age fields when a
    // pre-formatted string is not already provided.
    const details =
      item.patientDetails ||
      (item.gender && item.age ? `${item.gender}, ${item.age} yrs` : '');

    // Resolve symptoms / chief complaint from multiple possible field names.
    const symptoms =
      item.chiefComplaint || item.symptoms || item.notes || item.reason || '';

    // Resolve contact number from multiple possible field names.
    const contact =
      item.contactNumber || item.phone || item.contact || item.mobile || '';

    // Map status string → Tailwind colour class.
    const statusKey = (item.status || '').toLowerCase().replace(/\s+/g, '_');
    const statusDotColor = STATUS_COLOR_MAP[statusKey] || DEFAULT_STATUS_COLOR;

    // defaultOpen: use API value if present; otherwise open the first card only.
    const defaultOpen =
      typeof item.defaultOpen === 'boolean' ? item.defaultOpen : index === 0;

    return {
      id:            item.id            ?? index + 1,
      time:          this._formatTime(item.scheduledTime || item.time || item.appointmentTime || ''),
      patientName:   item.patientName   || item.patient   || item.name || '',
      contact,
      details,
      symptoms,
      statusDotColor,
      defaultOpen,
    };
  }

  // ─── Private formatters ────────────────────────────────────────────────────

  /**
   * Converts an ISO date string ("2023-10-26") to the display format used
   * in the header ("October 26, 2023").
   * Returns the original string unchanged if it is not parseable as a date.
   *
   * @param {string|null|undefined} isoDate
   * @returns {string}
   */
  _formatAppointmentDate(isoDate) {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return isoDate;
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day:   'numeric',
      year:  'numeric',
    });
  }

  /**
   * Normalises a time string to "H:MM AM/PM" display format.
   * Accepts:
   *   - Already formatted:  "10:30 AM"  → returned as-is
   *   - 24-hour:            "10:30"     → "10:30 AM"
   *   - 24-hour with secs:  "22:30:00"  → "10:30 PM"
   * Returns the original string unchanged if it cannot be parsed.
   *
   * @param {string} timeStr
   * @returns {string}
   */
  _formatTime(timeStr) {
    if (!timeStr) return '';

    // Already contains AM/PM — return as-is.
    if (/[ap]m/i.test(timeStr)) return timeStr;

    // Try to parse "HH:MM" or "HH:MM:SS".
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
 * @typedef {Object} AppointmentItem
 * @property {number|string} id
 * @property {string}        time           - Display time  e.g. "10:30 AM"
 * @property {string}        patientName
 * @property {string}        contact        - Phone number
 * @property {string}        details        - e.g. "Female, 34 yrs"
 * @property {string}        symptoms       - Chief complaint / notes
 * @property {string}        statusDotColor - Tailwind class e.g. "bg-green-500"
 * @property {boolean}       defaultOpen    - Whether the card is expanded on load
 */

/**
 * @typedef {Object} AppointmentsData
 * @property {string}            date  - Display date e.g. "October 26, 2023"
 * @property {AppointmentItem[]} list
 */

// Export as a singleton — one shared instance across the app.
export default new AppointmentsService();
