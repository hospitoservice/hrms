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
  /** Admin's response left when resolving/reviewing the complaint (Admin > Complaints, HOSPITO-WEB). */
  comment?: string;
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

  /** Complaints previously raised by this employee, most recent first. */
  async getByEmployee(employeeId: string): Promise<Complaint[]> {
    const res = await httpClient.get(`${BASE_URL}/employee/${encodeURIComponent(employeeId)}`);
    if (!res.ok) throw new Error(`ComplaintService: HTTP ${res.status}`);
    const body = (await res.json()) as ApiEnvelope<Complaint[]>;
    return body.data;
  },

  /** Maps a complaint status to Tailwind classes for a status pill. */
  statusColor(status: string): string {
    switch (status?.toUpperCase()) {
      case 'RESOLVED': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'REVIEWED': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'PENDING':
      default:         return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    }
  },

  /** "PENDING" -> "Pending" */
  statusLabel(status: string): string {
    if (!status) return 'Pending';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  },

  /** ISO timestamp -> "Oct 20, 2023" */
  formatDate(isoDateTime?: string): string {
    if (!isoDateTime) return '';
    const d = new Date(isoDateTime);
    if (isNaN(d.getTime())) return isoDateTime;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  },
};

export default ComplaintService;
