import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../service/AuthService.js';
import ComplaintService from '../service/ComplaintService';

const RegisterComplaint = () => {
  const navigate = useNavigate();
  const employeeId = AuthService.getEmployeeId();

  const [subject, setSubject]         = useState('');
  const [against, setAgainst]         = useState('');
  const [description, setDescription] = useState('');

  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    setSubmitError('');

    if (!subject.trim()) {
      setSubmitError('Please enter a subject.');
      return;
    }
    if (!against.trim()) {
      setSubmitError("Please enter who this complaint is against.");
      return;
    }
    if (!description.trim()) {
      setSubmitError('Please describe your complaint.');
      return;
    }
    if (!employeeId) {
      setSubmitError('Unable to identify employee. Please log in again.');
      return;
    }

    setSubmitting(true);
    try {
      await ComplaintService.fileComplaint({
        hospitalId: AuthService.getHospitalId() || '',
        employeeId,
        employeeName: AuthService.getName() || undefined,
        subject: subject.trim(),
        against: against.trim(),
        description: description.trim(),
      });
      setShowSuccess(true);
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-border-dark">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <span className="material-symbols-outlined text-text-main-light dark:text-text-main-dark">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">Register Complaint</h1>
        <div className="w-10"></div>
      </div>

      <main className="flex-1 p-4 space-y-6">
        {/* Previous Complaints */}
        <button
          onClick={() => navigate('/complaint-history')}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200 dark:border-border-dark bg-white dark:bg-card-dark hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <span className="flex items-center gap-2 font-semibold text-text-main-light dark:text-text-main-dark">
            <span className="material-symbols-outlined text-primary">history</span>
            Previous Complaints
          </span>
          <span className="material-symbols-outlined text-text-sub-light dark:text-text-sub-dark">chevron_right</span>
        </button>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-main-light dark:text-text-main-dark">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full h-14 px-4 bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark rounded-lg text-text-main-light dark:text-text-main-dark focus:ring-2 focus:ring-primary/50 outline-none placeholder-gray-400"
              placeholder="Briefly summarize your complaint"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-main-light dark:text-text-main-dark">Against</label>
            <input
              type="text"
              value={against}
              onChange={(e) => setAgainst(e.target.value)}
              className="w-full h-14 px-4 bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark rounded-lg text-text-main-light dark:text-text-main-dark focus:ring-2 focus:ring-primary/50 outline-none placeholder-gray-400"
              placeholder="Name of the person this complaint concerns"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-main-light dark:text-text-main-dark">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-4 bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark rounded-lg text-text-main-light dark:text-text-main-dark focus:ring-2 focus:ring-primary/50 outline-none h-48 resize-none"
              placeholder="Describe what happened in detail..."
            ></textarea>
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
          {submitting ? 'Submitting…' : 'Submit Complaint'}
        </button>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xs bg-white dark:bg-card-dark rounded-2xl p-6 flex flex-col items-center text-center shadow-xl">
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl text-green-600 dark:text-green-400">check_circle</span>
            </div>
            <h2 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">Complaint Registered</h2>
            <p className="text-sm text-text-sub-light dark:text-text-sub-dark mt-2">
              Your complaint has been submitted and will be reviewed shortly.
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

export default RegisterComplaint;
