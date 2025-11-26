import React from 'react';
import { useNavigate } from 'react-router-dom';

const Attendance = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background-light dark:bg-background-dark px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-border-dark">
        <h1 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">Attendance</h1>
        <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1j_xYmdzQI9vNcUr2ReJvR_qJ4e-AZF3pdXWCSB4PRxiUhks8w2mUiM3Ij4YGTz2vkie_sCZJ_9Xv_KvO_eLz3nfkvqPnE2zAQcxC6ObW4b8r89BF0x-6c0GWuTrREz-TuBqjQyERMmAsrLatuePTJ0BCdCAI2JyNJlHwLaBAmEB41Zn0Mqx8AuT6517cCU4mmRL93i91IfXnZEitl8Cxkvrz58OxYhurjMlbswziWaMzKrUczi3Cym5y8cnWH_x2dMGFNFTtTRE" alt="User" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-border-dark">
        <button className="flex-1 py-3 border-b-[3px] border-primary text-primary text-sm font-bold">My Records</button>
        <button className="flex-1 py-3 border-b-[3px] border-transparent text-text-sub-light dark:text-text-sub-dark text-sm font-bold">Facility Holidays</button>
      </div>

      <div className="p-4 space-y-6">
        {/* Month Selector */}
        <div className="flex items-center justify-between">
          <button className="flex items-center gap-2 bg-white dark:bg-card-dark px-3 py-2 rounded-lg border border-gray-200 dark:border-border-dark text-sm font-medium text-text-main-light dark:text-text-main-dark shadow-sm">
            October 2023
            <span className="material-symbols-outlined text-lg text-text-sub-light dark:text-text-sub-dark">expand_more</span>
          </button>
          <div className="flex gap-2">
             <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"><span className="material-symbols-outlined text-text-sub-light dark:text-text-sub-dark">chevron_left</span></button>
             <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"><span className="material-symbols-outlined text-text-sub-light dark:text-text-sub-dark">chevron_right</span></button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Shifts Worked', value: '18', color: 'text-green-600' },
            { label: 'Shifts Missed', value: '1', color: 'text-red-600' },
            { label: 'On Leave', value: '2', color: 'text-blue-500' },
            { label: 'Total Hours', value: '144h', color: 'text-text-main-light dark:text-text-main-dark' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-border-dark shadow-sm">
              <p className="text-sm font-medium text-text-sub-light dark:text-text-sub-dark mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Daily Records */}
        <div>
          <h2 className="text-base font-bold text-text-main-light dark:text-text-main-dark mb-3">Daily Records</h2>
          <div className="space-y-3">
             <div className="bg-white dark:bg-card-dark p-3 rounded-xl border border-gray-200 dark:border-border-dark shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center justify-center bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg w-12 h-14">
                    <span className="text-[10px] font-bold uppercase">Wed</span>
                    <span className="text-lg font-bold">18</span>
                  </div>
                  <div>
                    <p className="font-semibold text-text-main-light dark:text-text-main-dark">Day Shift</p>
                    <p className="text-xs text-text-sub-light dark:text-text-sub-dark">07:00 AM - 07:00 PM</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600 text-sm">On Time</p>
                  <p className="text-xs text-text-sub-light dark:text-text-sub-dark">8h 2m</p>
                </div>
             </div>

             <div className="bg-white dark:bg-card-dark p-3 rounded-xl border border-gray-200 dark:border-border-dark shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center justify-center bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg w-12 h-14">
                    <span className="text-[10px] font-bold uppercase">Tue</span>
                    <span className="text-lg font-bold">17</span>
                  </div>
                  <div>
                    <p className="font-semibold text-text-main-light dark:text-text-main-dark">Night Shift</p>
                    <p className="text-xs text-text-sub-light dark:text-text-sub-dark">07:00 PM - 07:00 AM</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600 text-sm">Absent</p>
                </div>
             </div>
             
             <div className="bg-white dark:bg-card-dark p-3 rounded-xl border border-gray-200 dark:border-border-dark shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg w-12 h-14">
                    <span className="text-[10px] font-bold uppercase">Mon</span>
                    <span className="text-lg font-bold">16</span>
                  </div>
                  <div>
                    <p className="font-semibold text-text-main-light dark:text-text-main-dark">Day Shift</p>
                    <p className="text-xs text-text-sub-light dark:text-text-sub-dark">07:00 AM - 07:00 PM</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-500 text-sm">Medical Leave</p>
                </div>
             </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button 
            onClick={() => navigate('/apply-leave')}
            className="flex items-center justify-center gap-2 py-3 rounded-lg border border-primary bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-colors"
          >
            <span className="material-symbols-outlined">medical_services</span>
            Apply Medical Leave
          </button>
          <button className="flex items-center justify-center gap-2 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-text-sub-light dark:text-text-sub-dark font-semibold hover:bg-gray-100 dark:hover:bg-card-dark transition-colors">
            <span className="material-symbols-outlined">work</span>
            Apply Duty Leave
          </button>
        </div>
      </div>
    </div>
  );
};

export default Attendance;