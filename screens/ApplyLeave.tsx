import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import appData from '../data/appData.json';
import AuthService from '../service/AuthService.js';
import LeaveService, { LeaveBalance } from '../service/LeaveService';

const { applyLeave: leaveData } = appData;
const { annualLeaveLabel, leaveTypes, staffingWarning } = leaveData;

interface LocationState {
  leaveType?: string;
}

const ApplyLeave = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const employeeId = AuthService.getEmployeeId();

  const initialLeaveType = (location.state as LocationState | null)?.leaveType ?? '';

  const [leaveType, setLeaveType] = useState(initialLeaveType);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate]     = useState('');
  const [duration, setDuration]   = useState(0);
  const [reason, setReason]       = useState('');

  const [balance, setBalance]         = useState<LeaveBalance | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(true);

  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end   = new Date(endDate);

      // Normalize to midnight to ensure accurate day diff
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);

      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      setDuration(diffDays > 0 ? diffDays : 0);
    } else {
      setDuration(0);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (!employeeId) {
      setBalanceLoading(false);
      return;
    }
    let cancelled = false;
    LeaveService.getBalance(employeeId)
      .then((lb) => { if (!cancelled) setBalance(lb); })
      .catch(() => { if (!cancelled) setBalance(null); })
      .finally(() => { if (!cancelled) setBalanceLoading(false); });
    return () => { cancelled = true; };
  }, [employeeId]);

  const handleDateClick = (e: React.MouseEvent<HTMLInputElement>) => {
    try {
      e.currentTarget.showPicker();
    } catch (error) {
      console.log('Show picker not supported or failed', error);
    }
  };

  const handleSubmit = async () => {
    setSubmitError('');

    if (!leaveType) {
      setSubmitError('Please select a leave type.');
      return;
    }
    if (!startDate || !endDate || duration <= 0) {
      setSubmitError('Please select a valid date range.');
      return;
    }
    if (!employeeId) {
      setSubmitError('Unable to identify employee. Please log in again.');
      return;
    }

    setSubmitting(true);
    try {
      await LeaveService.applyLeave(employeeId, { leaveType, startDate, endDate, reason });
      setShowSuccess(true);
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to submit leave request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const annualLeaveRemaining = balance?.annualLeaveRemaining;

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-border-dark">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <span className="material-symbols-outlined text-text-main-light dark:text-text-main-dark">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">Apply for Leave</h1>
        <div className="w-10"></div>
      </div>

      <main className="flex-1 p-4 space-y-6">
        {/* Previous Leave Application */}
        <button
          onClick={() => navigate('/leave-history')}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 dark:border-border-dark bg-white dark:bg-card-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <span className="flex items-center gap-2 font-semibold text-text-main-light dark:text-text-main-dark">
            <span className="material-symbols-outlined text-primary">history</span>
            Previous Leave Application
          </span>
          <span className="material-symbols-outlined text-text-sub-light dark:text-text-sub-dark">chevron_right</span>
        </button>

        {/* Balance Card */}
        <div className="flex items-center justify-between p-5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30">
          <div>
            <h2 className="text-xl font-bold text-primary dark:text-blue-400">
              {balanceLoading ? '—' : `${annualLeaveRemaining ?? 0} days`}
            </h2>
            <p className="text-sm text-blue-700 dark:text-blue-300">{annualLeaveLabel}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-white dark:bg-blue-800/50 flex items-center justify-center text-primary dark:text-blue-400">
            <span className="material-symbols-outlined text-2xl">event_available</span>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-main-light dark:text-text-main-dark">Leave Type</label>
            <div className="relative">
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className="w-full h-14 px-4 bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark rounded-lg appearance-none bg-none text-text-main-light dark:text-text-main-dark focus:ring-2 focus:ring-primary/50 outline-none"
              >
                <option value="" disabled>Select leave type</option>
                {leaveTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-sub-light dark:text-text-sub-dark">
                <span className="material-symbols-outlined">expand_more</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium text-text-main-light dark:text-text-main-dark">Start Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  onClick={handleDateClick}
                  className="w-full h-14 pl-12 pr-4 bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark rounded-lg text-text-main-light dark:text-text-main-dark focus:ring-2 focus:ring-primary/50 outline-none placeholder-gray-400 appearance-none"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-sub-light dark:text-text-sub-dark pointer-events-none">
                  <span className="material-symbols-outlined">calendar_month</span>
                </div>
              </div>
            </div>
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium text-text-main-light dark:text-text-main-dark">End Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  onClick={handleDateClick}
                  className="w-full h-14 pl-12 pr-4 bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark rounded-lg text-text-main-light dark:text-text-main-dark focus:ring-2 focus:ring-primary/50 outline-none placeholder-gray-400 appearance-none"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-sub-light dark:text-text-sub-dark pointer-events-none">
                  <span className="material-symbols-outlined">calendar_month</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-main-light dark:text-text-main-dark">Total Days</label>
            <div className="w-full h-14 px-4 flex items-center bg-gray-50 dark:bg-card-dark/50 border border-gray-200 dark:border-border-dark rounded-lg text-text-main-light dark:text-text-main-dark font-medium">
              {duration > 0 ? `${duration} Day${duration > 1 ? 's' : ''}` : '-'}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-main-light dark:text-text-main-dark">Reason for Leave</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-4 bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark rounded-lg text-text-main-light dark:text-text-main-dark focus:ring-2 focus:ring-primary/50 outline-none h-32 resize-none"
              placeholder="Provide a brief reason..."
            ></textarea>
          </div>
        </div>

        {/* Warning */}
        <div className="flex gap-4 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-xl">
          <div className="text-yellow-600 dark:text-yellow-500 shrink-0 mt-1">
            <span className="material-symbols-outlined">warning</span>
          </div>
          <div>
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-400">{staffingWarning.title}</h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1 leading-relaxed">
              {staffingWarning.message}
            </p>
          </div>
        </div>

        {submitError && (
          <div className="flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
            <span className="material-symbols-outlined text-[18px] flex-shrink-0">error</span>
            {submitError}
          </div>
        )}
      </main>

      <div className="p-4 bg-white dark:bg-background-dark border-t border-gray-200 dark:border-border-dark sticky bottom-0">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full h-14 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting…' : 'Submit Request'}
        </button>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xs bg-white dark:bg-card-dark rounded-2xl p-6 flex flex-col items-center text-center shadow-xl">
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl text-green-600 dark:text-green-400">check_circle</span>
            </div>
            <h2 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">Leave Applied</h2>
            <p className="text-sm text-text-sub-light dark:text-text-sub-dark mt-2">
              Your leave request has been submitted and is awaiting approval.
            </p>
            <button
              onClick={() => { setShowSuccess(false); navigate(-1); }}
              className="w-full h-12 mt-6 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplyLeave;
