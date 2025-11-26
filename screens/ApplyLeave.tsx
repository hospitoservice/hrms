import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ApplyLeave = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Normalize to midnight to ensure accurate day diff
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      if (diffDays > 0) {
        setDuration(diffDays);
      } else {
        setDuration(0);
      }
    } else {
      setDuration(0);
    }
  }, [startDate, endDate]);

  const handleDateClick = (e: React.MouseEvent<HTMLInputElement>) => {
    try {
      e.currentTarget.showPicker();
    } catch (error) {
      console.log('Show picker not supported or failed', error);
    }
  };

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
        {/* Balance Card */}
        <div className="flex items-center justify-between p-5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30">
          <div>
            <h2 className="text-xl font-bold text-primary dark:text-blue-400">12 days</h2>
            <p className="text-sm text-blue-700 dark:text-blue-300">Annual Leave Balance</p>
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
              {/* Added bg-none to remove default form plugin background arrow */}
              <select defaultValue="" className="w-full h-14 px-4 bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark rounded-lg appearance-none bg-none text-text-main-light dark:text-text-main-dark focus:ring-2 focus:ring-primary/50 outline-none">
                <option value="" disabled>Select leave type</option>
                <option value="annual">Annual Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="emergency">Emergency Leave</option>
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
                  // Trigger picker on click
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
                  // Trigger picker on click
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
             <h3 className="font-semibold text-yellow-800 dark:text-yellow-400">Staffing Impact</h3>
             <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1 leading-relaxed">
               Your absence falls on a high-demand period. Please confirm patient hand-offs and coordinate with your department head before submitting.
             </p>
           </div>
        </div>
      </main>

      <div className="p-4 bg-white dark:bg-background-dark border-t border-gray-200 dark:border-border-dark sticky bottom-0">
        <button 
          onClick={() => navigate(-1)}
          className="w-full h-14 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center"
        >
          Submit Request
        </button>
      </div>
    </div>
  );
};

export default ApplyLeave;