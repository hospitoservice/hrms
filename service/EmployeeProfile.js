/**
 * EmployeeProfile Service
 *
 * Makes REST calls to the employee microservice and maps the API response
 * to the internal ProfileData shape consumed by Profile.tsx.
 *
 * Base URL is read from the VITE_EMPLOYEE_SERVICE_URL environment variable.
 * Set it in a .env file:
 *   VITE_EMPLOYEE_SERVICE_URL=http://localhost:8080/api
 *
 * Expected API response shape from GET /employees/{staffId}/profile:
 * {
 *   employeeId        : string   // e.g. "DOC56789"
 *   firstName         : string
 *   lastName          : string
 *   fullName          : string   // optional — used directly if present
 *   designation       : string   // e.g. "Psychiatrist"
 *   department        : string
 *   workplace         : string   // hospital / facility name
 *   medicalLicense    : string   // or licenseNumber
 *   joiningDate       : string   // ISO-8601  e.g. "2021-01-15"
 *   dob               : string   // ISO-8601  e.g. "1995-08-08"
 *   homeAddress       : string
 *   workEmail         : string
 *   personalEmail     : string
 *   workPhone         : string
 *   emergencyContactName  : string
 *   emergencyContactPhone : string
 *   profileImageUrl   : string   // URL for the large avatar
 * }
 */

import httpClient from './httpClient.js';

const BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_EMPLOYEE_SERVICE_URL) ||
  '/api';

class EmployeeProfile {
  /**
   * @param {string} [baseUrl] - Override the microservice base URL (useful in tests).
   */
  constructor(baseUrl = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /**
   * Fetches the employee profile from the microservice.
   *
   * @param {string} staffId - The employee's staff / employee ID.
   * @returns {Promise<ProfileData>} Normalised profile data.
   * @throws {Error} When the network request fails or the server returns a
   *                 non-2xx status code.
   */
  async getProfile(staffId) {
    const url = `${this.baseUrl}/employees/${encodeURIComponent(staffId)}/profile`;

    const response = await httpClient.get(url);

    if (!response.ok) {
      throw new Error(
        `EmployeeProfile.getProfile failed — HTTP ${response.status} for staffId "${staffId}"`
      );
    }

    const raw = await response.json();
    return this._mapToProfileData(raw);
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  /**
   * Normalises the raw API payload to the internal ProfileData shape.
   * Every field falls back gracefully so a partial API response never
   * results in undefined values in the UI.
   *
   * @param {Object} raw - Raw JSON from the employee microservice.
   * @returns {ProfileData}
   */
  _mapToProfileData(raw) {
    const fullName =
      raw.fullName ||
      [raw.firstName, raw.lastName].filter(Boolean).join(' ') ||
      '';

    return {
      // ── Header ──────────────────────────────────────────────────────────
      fullName,
      staffId: raw.employeeId || raw.staffId || '',
      avatarLarge: raw.profileImageUrl || raw.avatarLarge || raw.avatar || '',

      // ── Medical Credentials ─────────────────────────────────────────────
      designation:    raw.designation  || raw.jobTitle    || '',
      workplace:      raw.workplace    || raw.hospitalName || raw.facility || '',
      medicalLicense: raw.medicalLicense || raw.licenseNumber || '',
      department:     raw.department   || '',
      dateOfJoining:  raw.dateOfJoining || this._formatDate(raw.joiningDate) || '',

      // ── Contact Information ─────────────────────────────────────────────
      workEmail:  raw.workEmail  || raw.email || '',
      workPhone:  raw.workPhone  || raw.phone || '',
      emergencyContact:
        raw.emergencyContact ||
        (raw.emergencyContactName && raw.emergencyContactPhone
          ? `${raw.emergencyContactName} - ${raw.emergencyContactPhone}`
          : ''),

      // ── Personal Information ────────────────────────────────────────────
      dateOfBirth:   raw.dateOfBirth  || this._formatDate(raw.dob) || '',
      homeAddress:   raw.homeAddress  || raw.address || '',
      personalEmail: raw.personalEmail || '',
    };
  }

  /**
   * Converts an ISO-8601 date string (e.g. "2021-01-15") to the display
   * format used across the app (e.g. "15 Jan 2021").
   *
   * @param {string|null|undefined} isoDate
   * @returns {string}
   */
  _formatDate(isoDate) {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return isoDate; // return as-is if not parseable
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}

/**
 * @typedef {Object} ProfileData
 * @property {string} fullName
 * @property {string} staffId
 * @property {string} avatarLarge
 * @property {string} designation
 * @property {string} workplace
 * @property {string} medicalLicense
 * @property {string} department
 * @property {string} dateOfJoining
 * @property {string} workEmail
 * @property {string} workPhone
 * @property {string} emergencyContact
 * @property {string} dateOfBirth
 * @property {string} homeAddress
 * @property {string} personalEmail
 */

// Export as a singleton — one shared instance across the app.
export default new EmployeeProfile();
