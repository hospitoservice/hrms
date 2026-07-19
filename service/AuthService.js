/**
 * AuthService
 *
 * Handles employee authentication against the authService REST API
 * (POST /api/auth/login) and manages JWT storage in localStorage.
 *
 * The authService endpoint is proxied through Vite:
 *   /api/auth/login  →  http://auth-service:9000/api/auth/login  (Docker)
 *   /api/auth/login  →  http://localhost:9000/api/auth/login     (local dev)
 */

const TOKEN_KEY       = 'authToken';
const EMPLOYEE_ID_KEY = 'employeeId';
const NAME_KEY        = 'employeeName';
const ROLE_KEY        = 'employeeRole';
const HOSPITAL_ID_KEY = 'employeeHospitalId';

const AuthService = {
  // ── Login ────────────────────────────────────────────────────────────────

  /**
   * Authenticates an employee and stores the JWT in localStorage.
   *
   * @param {string} employeeId - e.g. "DOC56789"
   * @param {string} password
   * @returns {Promise<{ token, employeeId, name, role, expiresIn }>}
   * @throws {Error} with a user-facing message on failure
   */
  async login(employeeId, password) {
    let response;
    try {
      response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, password }),
      });
    } catch {
      throw new Error('Cannot reach the server. Check your connection.');
    }

    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error(
        response.ok
          ? 'Unexpected server response. Please try again.'
          : `Server error (${response.status}). Please try again.`
      );
    }

    if (!response.ok) {
      throw new Error(data.message || 'Login failed. Please try again.');
    }

    if (!data.token) {
      throw new Error('Authentication error: no token received.');
    }

    // Persist session data
    localStorage.setItem(TOKEN_KEY,       data.token);
    localStorage.setItem(EMPLOYEE_ID_KEY, data.employeeId ?? employeeId);
    localStorage.setItem(NAME_KEY,        data.name       ?? '');
    localStorage.setItem(ROLE_KEY,        data.role       ?? '');
    localStorage.setItem(HOSPITAL_ID_KEY, data.hospitalId ?? '');

    return data;
  },

  // ── Logout ────────────────────────────────────────────────────────────────

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMPLOYEE_ID_KEY);
    localStorage.removeItem(NAME_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(HOSPITAL_ID_KEY);
  },

  // ── Token helpers ─────────────────────────────────────────────────────────

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getEmployeeId() {
    return localStorage.getItem(EMPLOYEE_ID_KEY);
  },

  getName() {
    return localStorage.getItem(NAME_KEY);
  },

  getRole() {
    return localStorage.getItem(ROLE_KEY);
  },

  getHospitalId() {
    return localStorage.getItem(HOSPITAL_ID_KEY);
  },

  /**
   * Returns true if there is a non-expired JWT in localStorage.
   * Expiry is checked by decoding the `exp` claim in the payload segment of
   * the token — no secret is needed for this (it is not a verification step).
   */
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payloadBase64 = token.split('.')[1];
      const payload = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));
      return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  },
};

export default AuthService;
