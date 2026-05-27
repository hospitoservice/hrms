/**
 * httpClient
 *
 * A thin fetch wrapper that automatically attaches the JWT Bearer token from
 * localStorage to every request.  All existing service classes (EmployeeProfile,
 * AppointmentsService, AttendanceService, BenefitsService, PayrollService)
 * should use this instead of calling fetch() directly.
 *
 * On a 401 response the client clears local credentials and redirects the
 * user to the login page via the HashRouter path "#/login".
 */

import AuthService from './AuthService.js';

const httpClient = {
  // ── Public methods ────────────────────────────────────────────────────────

  get(url) {
    return this._request('GET', url);
  },

  post(url, body) {
    return this._request('POST', url, body);
  },

  put(url, body) {
    return this._request('PUT', url, body);
  },

  patch(url, body) {
    return this._request('PATCH', url, body);
  },

  delete(url) {
    return this._request('DELETE', url);
  },

  // ── Core request ─────────────────────────────────────────────────────────

  async _request(method, url, body) {
    const token = AuthService.getToken();

    const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    // Token has expired or is invalid — clear session and redirect to login.
    if (response.status === 401) {
      AuthService.logout();
      // HashRouter uses the hash fragment; redirect to /#/login
      window.location.assign('/#/login');
      throw new Error('Session expired. Please log in again.');
    }

    return response;
  },
};

export default httpClient;
