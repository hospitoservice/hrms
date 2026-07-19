/**
 * LeaveService
 *
 * Fetches leave balance and manages leave applications for the employee-service.
 * The Vite proxy routes /api → http://employee-service:8082
 *
 * Endpoints used:
 *   GET  /api/employees/{staffId}/leave/balance      – current leave balance
 *   POST /api/employees/{staffId}/leave/apply        – submit a new leave request
 *   GET  /api/employees/{staffId}/leave/applications  – leave request history
 *
 * Uses httpClient so the JWT Bearer token is attached automatically.
 */

import httpClient from './httpClient.js';

const BASE_URL = '/api';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface LeaveBalance {
  annualLeaveTotal: number;
  annualLeaveTaken: number;
  annualLeaveRemaining: number;
  sickLeaveTotal: number;
  sickLeaveTaken: number;
  sickLeaveRemaining: number;
  dutyLeaveTotal: number;
  dutyLeaveTaken: number;
  dutyLeaveRemaining: number;
  casualLeaveTotal: number;
  casualLeaveTaken: number;
  casualLeaveRemaining: number;
}

export interface LeaveApplicationRequest {
  leaveType: string;
  startDate: string; // "YYYY-MM-DD"
  endDate: string;   // "YYYY-MM-DD"
  reason: string;
}

export interface LeaveApplication {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  appliedAt: string;
}

// ── Service ────────────────────────────────────────────────────────────────────

const LeaveService = {

  async getBalance(staffId: string): Promise<LeaveBalance> {
    const res = await httpClient.get(`${BASE_URL}/employees/${encodeURIComponent(staffId)}/leave/balance`);
    if (!res.ok) throw new Error(`LeaveService: HTTP ${res.status}`);
    return res.json() as Promise<LeaveBalance>;
  },

  async applyLeave(staffId: string, request: LeaveApplicationRequest): Promise<LeaveApplication> {
    const res = await httpClient.post(
      `${BASE_URL}/employees/${encodeURIComponent(staffId)}/leave/apply`,
      request
    );
    if (!res.ok) throw new Error(`LeaveService: HTTP ${res.status}`);
    return res.json() as Promise<LeaveApplication>;
  },

  async getApplications(staffId: string): Promise<LeaveApplication[]> {
    const res = await httpClient.get(`${BASE_URL}/employees/${encodeURIComponent(staffId)}/leave/applications`);
    if (!res.ok) throw new Error(`LeaveService: HTTP ${res.status}`);
    return res.json() as Promise<LeaveApplication[]>;
  },

  /** Maps an application status to Tailwind classes for a status pill. */
  statusColor(status: string): string {
    switch (status?.toUpperCase()) {
      case 'APPROVED': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'REJECTED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'PENDING':
      default:         return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    }
  },

  /** "PENDING" -> "Pending" */
  statusLabel(status: string): string {
    if (!status) return 'Pending';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  },

  /** "2023-10-20" -> "Oct 20, 2023" */
  formatDate(isoDate?: string): string {
    if (!isoDate) return '';
    const d = new Date(isoDate + 'T00:00:00');
    if (isNaN(d.getTime())) return isoDate;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  },
};

export default LeaveService;
