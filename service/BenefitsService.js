/**
 * BenefitsService
 *
 * Makes REST calls to the EMPLOYEE microservice to fetch benefits data
 * and maps the API response to the internal BenefitsData shape consumed
 * by Benefits.tsx.
 *
 * Base URL is read from the VITE_EMPLOYEE_SERVICE_URL environment variable —
 * the same variable shared by all services in this app.
 * Set it in a .env file:
 *   VITE_EMPLOYEE_SERVICE_URL=http://localhost:8080/api
 *
 * ─── Endpoint ─────────────────────────────────────────────────────────────────
 *
 *  GET /employees/{staffId}/benefits
 *
 *  Expected response shape:
 *  {
 *    benefits : [
 *      {
 *        id               : number | string
 *        category         : string   // "Insurance" | "Professional" | "Wellness"
 *                                    // also accepted: type / benefitType / benefitCategory
 *        name             : string   // benefit title
 *                                    // also accepted: title / benefitName
 *        description      : string   // short subtitle / detail line
 *                                    // also accepted: subtitle / details / summary
 *        iconCode         : string   // Material Symbol name e.g. "gavel"
 *                                    // also accepted: icon / materialIcon
 *        enrollmentStatus : string   // see STATUS_STYLE_MAP below for accepted values
 *                                    // also accepted: status / benefitStatus
 *      }
 *    ]
 *  }
 *
 *  The categories filter list is derived automatically from the unique
 *  category values returned in the items array, so no separate endpoint
 *  is needed.
 */

import httpClient from './httpClient.js';

const BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_EMPLOYEE_SERVICE_URL) ||
  '/api';

/**
 * Maps a normalised status key to the two Tailwind classes used by the
 * status indicator (dot colour + label text colour).
 */
const STATUS_STYLE_MAP = {
  active:        { statusColor: 'bg-green-500',  statusText: 'text-green-600 dark:text-green-400'   },
  enrolled:      { statusColor: 'bg-green-500',  statusText: 'text-green-600 dark:text-green-400'   },
  approved:      { statusColor: 'bg-green-500',  statusText: 'text-green-600 dark:text-green-400'   },
  claim_pending: { statusColor: 'bg-yellow-500', statusText: 'text-yellow-600 dark:text-yellow-400' },
  pending:       { statusColor: 'bg-yellow-500', statusText: 'text-yellow-600 dark:text-yellow-400' },
  under_review:  { statusColor: 'bg-yellow-500', statusText: 'text-yellow-600 dark:text-yellow-400' },
  not_utilized:  { statusColor: 'bg-gray-400',   statusText: 'text-gray-500 dark:text-gray-400'     },
  not_enrolled:  { statusColor: 'bg-gray-400',   statusText: 'text-gray-500 dark:text-gray-400'     },
  inactive:      { statusColor: 'bg-gray-400',   statusText: 'text-gray-500 dark:text-gray-400'     },
  expired:       { statusColor: 'bg-red-500',    statusText: 'text-red-600 dark:text-red-400'       },
  cancelled:     { statusColor: 'bg-red-500',    statusText: 'text-red-600 dark:text-red-400'       },
  rejected:      { statusColor: 'bg-red-500',    statusText: 'text-red-600 dark:text-red-400'       },
};

/** Fallback style when status is absent or unrecognised. */
const DEFAULT_STATUS_STYLE = {
  statusColor: 'bg-gray-400',
  statusText:  'text-gray-500 dark:text-gray-400',
};

class BenefitsService {
  /**
   * @param {string} [baseUrl] - Override the microservice base URL (useful in tests).
   */
  constructor(baseUrl = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /**
   * Fetches the employee's benefits list from the employee microservice.
   *
   * @param {string} staffId - The employee's staff / employee ID.
   * @returns {Promise<BenefitsData>} Normalised benefits data.
   * @throws {Error} When the network request fails or the server returns a
   *                 non-2xx status code.
   */
  async getBenefits(staffId) {
    const url = `${this.baseUrl}/employees/${encodeURIComponent(staffId)}/benefits`;

    const response = await httpClient.get(url);

    if (!response.ok) {
      throw new Error(
        `BenefitsService.getBenefits failed — HTTP ${response.status} for staffId "${staffId}"`
      );
    }

    const raw = await response.json();
    return this._mapToBenefitsData(raw);
  }

  // ─── Private mappers ───────────────────────────────────────────────────────

  /**
   * Normalises the raw API payload to the internal BenefitsData shape.
   *
   * @param {Object} raw - Raw JSON from the employee microservice.
   * @returns {BenefitsData}
   */
  _mapToBenefitsData(raw) {
    const rawList = Array.isArray(raw)
      ? raw
      : (raw.benefits || raw.benefitsList || raw.data || []);

    const items = rawList.map((item, index) => this._mapBenefitItem(item, index));

    // Derive categories dynamically from the returned items so the filter
    // chips always reflect exactly what the API sent back.
    const categories = this._deriveCategories(items);

    return { categories, items };
  }

  /**
   * Normalises a single benefit record.
   *
   * @param {Object}  item  - Raw benefit object from the API.
   * @param {number}  index - Array index used as id fallback.
   * @returns {BenefitItem}
   */
  _mapBenefitItem(item, index) {
    // Resolve the benefit category / type.
    const type = item.category || item.type || item.benefitType || item.benefitCategory || '';

    // Resolve the display title.
    const title = item.name || item.title || item.benefitName || '';

    // Resolve the subtitle / description.
    const subtitle = item.description || item.subtitle || item.details || item.summary || '';

    // Resolve the Material Symbol icon code.
    const icon = item.iconCode || item.icon || item.materialIcon || 'card_membership';

    // Map status string → display label + Tailwind classes.
    const rawStatus   = item.enrollmentStatus || item.status || item.benefitStatus || '';
    const statusKey   = rawStatus.toLowerCase().replace(/[\s-]+/g, '_');
    const style       = STATUS_STYLE_MAP[statusKey] || DEFAULT_STATUS_STYLE;
    const statusLabel = this._resolveStatusLabel(rawStatus);

    return {
      id:          item.id ?? index + 1,
      type,
      title,
      subtitle,
      icon,
      status:      statusLabel,
      statusColor: style.statusColor,
      statusText:  style.statusText,
    };
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  /**
   * Derives the ordered categories array from the items list.
   * "All" is always prepended; subsequent values are unique types
   * in the order they first appear in the list.
   *
   * @param {BenefitItem[]} items
   * @returns {string[]}
   */
  _deriveCategories(items) {
    const seen = new Set();
    const unique = [];
    for (const item of items) {
      if (item.type && !seen.has(item.type)) {
        seen.add(item.type);
        unique.push(item.type);
      }
    }
    return ['All', ...unique];
  }

  /**
   * Converts a raw status token into a human-readable display label.
   * Already-readable strings (e.g. "Active", "Claim Pending") pass through.
   * snake_case / kebab-case tokens are converted to Title Case.
   *
   * @param {string} raw
   * @returns {string}
   */
  _resolveStatusLabel(raw) {
    if (!raw) return '';
    return raw
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

/**
 * @typedef {Object} BenefitItem
 * @property {number|string} id
 * @property {string}        type         - Category e.g. "Insurance"
 * @property {string}        title        - Benefit name
 * @property {string}        subtitle     - Short detail line
 * @property {string}        icon         - Material Symbol name
 * @property {string}        status       - Display label  e.g. "Active"
 * @property {string}        statusColor  - Tailwind dot colour  e.g. "bg-green-500"
 * @property {string}        statusText   - Tailwind label colour e.g. "text-green-600 dark:text-green-400"
 */

/**
 * @typedef {Object} BenefitsData
 * @property {string[]}      categories - ["All", "Insurance", ...]
 * @property {BenefitItem[]} items
 */

// Export as a singleton — one shared instance across the app.
export default new BenefitsService();
