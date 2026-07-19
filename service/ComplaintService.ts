/**
 * ComplaintService
 *
 * Submits employee complaints to the hospital-service.
 * The Vite proxy routes /api/complaints → http://hospital-app:8100/api/complaints
 *
 * Note: hospital-service wraps every response in an { success, message, data }
 * envelope (unlike employee-service's bare-object responses), so responses
 * here are unwrapped via `.data` before being returned.
 */

import httpClient from './httpClient.js';

const BASE_URL = '/api/complaints';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ComplaintRequest {
  hospitalId: string;
  employeeId: string;
  employeeName?: string;
  subject: string;
  against: string;
  description: string;
}

export interface Complaint extends ComplaintRequest {
  id: string;
  status: string;
  createdAt: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

// ── Service ────────────────────────────────────────────────────────────────────

const ComplaintService = {

  async fileComplaint(request: ComplaintRequest): Promise<Complaint> {
    const res = await httpClient.post(BASE_URL, request);
    if (!res.ok) throw new Error(`ComplaintService: HTTP ${res.status}`);
    const body = (await res.json()) as ApiEnvelope<Complaint>;
    return body.data;
  },
};

export default ComplaintService;
