/**
 * PayrollService
 *
 * Makes REST calls to the EMPLOYEE microservice (same service as EmployeeProfile)
 * to fetch payroll data and maps the API response to the internal PayrollData
 * shape consumed by Payroll.tsx.
 *
 * Base URL is read from the VITE_EMPLOYEE_SERVICE_URL environment variable —
 * the same variable used by EmployeeProfile.js.
 * Set it in a .env file:
 *   VITE_EMPLOYEE_SERVICE_URL=http://localhost:8080/api
 *
 * ─── Endpoints ────────────────────────────────────────────────────────────────
 *
 *  GET /employees/{staffId}/payroll/summary
 *  Returns the latest payslip, compensation breakdown, and annual salary.
 *  Expected shape:
 *  {
 *    staffId            : string          // e.g. "DOC56789"
 *    latestPayslip      : {
 *      period           : string          // ISO month  "2025-10"  OR display  "October 2025"
 *      paidDate         : string          // ISO date   "2025-10-30"
 *      netPay           : number          // 8750.00
 *    }
 *    compensationBreakdown : [            // also accepted: compensationPackage / compensation
 *      {
 *        component      : string          // "Base Salary"  (also: label / name)
 *        amount         : number          // positive for earnings, negative for deductions
 *        type           : string          // "earning" | "deduction"  — used to coerce sign
 *      }
 *    ]
 *    annualSalary       : number          // 106800.00  (also: annualCtc / totalAnnual)
 *  }
 *
 *  GET /employees/{staffId}/payroll/payslips
 *  Returns the historical payslip list (most-recent first).
 *  Expected shape:
 *  [
 *    {
 *      period           : string          // ISO month  "2023-10"  OR display  "October 2023"
 *      paidDate         : string          // ISO date   "2023-10-31"
 *      netPay           : number          // 8680.00
 *    }
 *  ]
 */

import httpClient from './httpClient.js';

const BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_EMPLOYEE_SERVICE_URL) ||
  '/api';

class PayrollService {
  /**
   * @param {string} [baseUrl] - Override the microservice base URL (useful in tests).
   */
  constructor(baseUrl = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /**
   * Fetches the complete payroll data for a staff member in a single call.
   * Fires the summary and history requests concurrently; both must succeed.
   *
   * @param {string} staffId - The employee's staff / employee ID.
   * @returns {Promise<PayrollData>} Normalised payroll data.
   * @throws {Error} When either network request fails or the server returns
   *                 a non-2xx status code.
   */
  async getPayrollData(staffId) {
    const [summary, history] = await Promise.all([
      this.getPayrollSummary(staffId),
      this.getPayslipHistory(staffId),
    ]);

    return { ...summary, payslipHistory: history };
  }

  /**
   * Fetches the latest payslip, compensation breakdown and annual salary.
   *
   * @param {string} staffId
   * @returns {Promise<PayrollSummary>}
   * @throws {Error}
   */
  async getPayrollSummary(staffId) {
    const url = `${this.baseUrl}/employees/${encodeURIComponent(staffId)}/payroll/summary`;

    const response = await httpClient.get(url);

    if (!response.ok) {
      throw new Error(
        `PayrollService.getPayrollSummary failed — HTTP ${response.status} for staffId "${staffId}"`
      );
    }

    const raw = await response.json();
    return this._mapSummary(raw);
  }

  /**
   * Fetches the historical payslip list.
   *
   * @param {string} staffId
   * @returns {Promise<PayslipHistoryItem[]>}
   * @throws {Error}
   */
  async getPayslipHistory(staffId) {
    const url = `${this.baseUrl}/employees/${encodeURIComponent(staffId)}/payroll/payslips`;

    const response = await httpClient.get(url);

    if (!response.ok) {
      throw new Error(
        `PayrollService.getPayslipHistory failed — HTTP ${response.status} for staffId "${staffId}"`
      );
    }

    const raw = await response.json();
    const items = Array.isArray(raw) ? raw : (raw.payslips || raw.payslipHistory || []);
    return items.map((item) => this._mapHistoryItem(item));
  }

  // ─── Private mappers ───────────────────────────────────────────────────────

  /**
   * Normalises the raw summary payload.
   *
   * @param {Object} raw
   * @returns {PayrollSummary}
   */
  _mapSummary(raw) {
    const latestRaw = raw.latestPayslip || raw.currentPayslip || {};

    return {
      latestPayslip: {
        month:    this._parsePeriod(latestRaw.period)      || latestRaw.month    || '',
        paidDate: this._formatPaidDate(latestRaw.paidDate) || latestRaw.paid     || '',
        netPay:   this._formatCurrency(latestRaw.netPay)   || latestRaw.netPay   || '',
      },
      compensationPackage: this._mapCompensation(
        raw.compensationBreakdown || raw.compensationPackage || raw.compensation || []
      ),
      annualSalary: this._formatCurrency(
        raw.annualSalary ?? raw.annualCtc ?? raw.totalAnnual ?? 0
      ),
    };
  }

  /**
   * Normalises a single compensation line item.
   * Handles both "earning / deduction" type fields and pre-signed amounts.
   *
   * @param {Object[]} items
   * @returns {{ label: string, value: string }[]}
   */
  _mapCompensation(items) {
    return items.map((item) => {
      const label = item.component || item.label || item.name || '';
      let amount  = item.amount ?? item.value ?? 0;

      // If the API marks it as a deduction but sends a positive number, flip the sign.
      if (item.type === 'deduction' && typeof amount === 'number' && amount > 0) {
        amount = -amount;
      }

      return {
        label,
        value: typeof amount === 'number' ? this._formatCurrency(amount) : String(amount),
      };
    });
  }

  /**
   * Normalises a single payslip history record.
   *
   * @param {Object} item
   * @returns {PayslipHistoryItem}
   */
  _mapHistoryItem(item) {
    return {
      month:  this._parsePeriod(item.period)              || item.month  || '',
      paid:   this._formatPaidDateWithYear(item.paidDate)  || item.paid   || '',
      amount: this._formatCurrency(item.netPay)            || item.amount || '',
    };
  }

  // ─── Private formatters ────────────────────────────────────────────────────

  /**
   * Parses an ISO month string ("2025-10" or "2025-10-30") into
   * a human-readable month + year ("October 2025").
   * Returns the original string if it is not parseable as a date.
   *
   * @param {string|null|undefined} periodStr
   * @returns {string}
   */
  _parsePeriod(periodStr) {
    if (!periodStr) return '';
    const normalised = periodStr.length === 7 ? `${periodStr}-01` : periodStr;
    const date = new Date(normalised);
    if (isNaN(date.getTime())) return periodStr;
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  /**
   * Formats an ISO date string to short paid-date display ("Oct 30").
   *
   * @param {string|null|undefined} isoDate
   * @returns {string}
   */
  _formatPaidDate(isoDate) {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return isoDate;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  /**
   * Formats an ISO date string to full paid-date display ("Oct 31, 2023").
   *
   * @param {string|null|undefined} isoDate
   * @returns {string}
   */
  _formatPaidDateWithYear(isoDate) {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return isoDate;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  /**
   * Formats a numeric amount as a USD currency string ("$8,750.00").
   * Negative values are formatted as "-$450.00".
   *
   * @param {number|null|undefined} amount
   * @returns {string}
   */
  _formatCurrency(amount) {
    if (amount === null || amount === undefined || isNaN(Number(amount))) return '';
    const num = Number(amount);
    const abs = Math.abs(num);
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(abs);
    return num < 0 ? `-${formatted}` : formatted;
  }
}

/**
 * @typedef {Object} PayslipSummary
 * @property {string} month      - Display period e.g. "October 2025"
 * @property {string} paidDate   - Display date  e.g. "Oct 30"
 * @property {string} netPay     - Formatted     e.g. "$8,750.00"
 */

/**
 * @typedef {Object} CompensationItem
 * @property {string} label  - e.g. "Base Salary"
 * @property {string} value  - e.g. "$8,000.00"  or "-$450.00"
 */

/**
 * @typedef {Object} PayslipHistoryItem
 * @property {string} month  - Display period  e.g. "October 2023"
 * @property {string} paid   - Display date    e.g. "Oct 31, 2023"
 * @property {string} amount - Formatted       e.g. "$8,680.00"
 */

/**
 * @typedef {Object} PayrollSummary
 * @property {PayslipSummary}     latestPayslip
 * @property {CompensationItem[]} compensationPackage
 * @property {string}             annualSalary
 */

/**
 * @typedef {PayrollSummary & { payslipHistory: PayslipHistoryItem[] }} PayrollData
 */

// Export as a singleton — one shared instance across the app.
export default new PayrollService();
