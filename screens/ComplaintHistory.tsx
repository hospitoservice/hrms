import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../service/AuthService.js';
import ComplaintService, { Complaint } from '../service/ComplaintService';

const ComplaintHistory = () => {
  const navigate = useNavigate();
  const employeeId = AuthService.getEmployeeId();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!employeeId) {
      setLoading(false);
      setError('Unable to identify employee. Please log in again.');
      return;
    }
    let cancelled = false;
    ComplaintService.getByEmployee(employeeId)
      .then((data) => { if (!cancelled) setComplaints(data); })
      .catch((err) => { if (!cancelled) setError(err?.message || 'Failed to load complaints.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [employeeId]);

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-border-dark">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <span className="material-symbols-outlined text-text-main-light dark:text-text-main-dark">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">Previous Complaints</h1>
        <div className="w-10"></div>
      </div>

      <main className="flex-1 p-4 space-y-3">
        {loading && (
          <p className="text-center text-text-sub-light dark:text-text-sub-dark py-8">Loading…</p>
        )}

        {!loading && error && (
          <div className="flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
            <span className="material-symbols-outlined text-[18px] flex-shrink-0">error</span>
            {error}
          </div>
        )}

        {!loading && !error && complaints.length === 0 && (
          <div className="flex flex-col items-center text-center py-16 gap-3">
            <span className="material-symbols-outlined text-4xl text-text-sub-light dark:text-text-sub-dark">campaign</span>
            <p className="text-text-sub-light dark:text-text-sub-dark">No complaints raised yet.</p>
          </div>
        )}

        {!loading && !error && complaints.map((c) => (
          <div
            key={c.id}
            className="p-4 rounded-xl bg-white dark:bg-card-dark border border-gray-100 dark:border-border-dark shadow-sm space-y-2"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-text-main-light dark:text-text-main-dark">{c.subject}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${ComplaintService.statusColor(c.status)}`}>
                {ComplaintService.statusLabel(c.status)}
              </span>
            </div>
            <p className="text-sm text-text-sub-light dark:text-text-sub-dark">
              Against {c.against} · {ComplaintService.formatDate(c.createdAt)}
            </p>
            {c.description && (
              <p className="text-sm text-text-main-light dark:text-text-main-dark">{c.description}</p>
            )}
            {c.comment && (
              <div className="mt-1 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">Admin Response</p>
                <p className="text-sm text-text-main-light dark:text-text-main-dark mt-0.5">{c.comment}</p>
              </div>
            )}
          </div>
        ))}
      </main>
    </div>
  );
};

export default ComplaintHistory;
