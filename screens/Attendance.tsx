import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import appData from '../data/appData.json';
import AttendanceServiceInstance from '../service/AttendanceService.js';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatItem {
  label: string;
  value: string;
  color: string;
}

interface DailyRecord {
  dayLabel:    string;
  date:        string;
  shiftName:   string;
  shiftTime:   string;
  status:      string;
  duration:    string;
  dateBoxBg:   string;
  dateBoxText: string;
  statusColor: string;
}

interface AttendanceData {
  currentMonth: string;
  stats:        StatItem[];
  dailyRecords: DailyRecord[];
}

// ─── JSON fallback ────────────────────────────────────────────────────────────
// Seed state with local data so the screen is always immediately usable,
// even before the network call completes or if it fails entirely.

const jsonFallback: AttendanceData = {
  currentMonth: appData.attendance.currentMonth,
  stats:        appData.attendance.stats,
  dailyRecords: appData.attendance.dailyRecords,
};

// Tabs are static UI labels — they don't come from the API.
const { tabs } = appData.attendance;
const { user } = appData;

// ─── Component ────────────────────────────────────────────────────────────────

const Attendance = () => {
  const navigate = useNavigate();

  // Start with JSON data — screen renders instantly on every load.
  const [attendance, setAttendance] = useState<AttendanceData>(jsonFallback);
  const [dataSource, setDataSource] = useState<'api' | 'local'>('local');
  const [activeTab, setActiveTab]   = useState(0);

  useEffect(() => {
    const loadAttendance = async () => {
      try {
        // Attempt to fetch live data from the employee microservice.
        // No month/year passed — service defaults to the current month.
        const apiData: AttendanceData = await AttendanceServiceInstance.getAttendance(
          user.staffId
        );
        setAttendance(apiData);
        setDataSource('api');
      } catch (error) {
        // Network failure, non-2xx response, or any other runtime error.
        // State is already seeded with JSON data — screen stays fully functional.
        console.warn(
          '[Attendance] Could not load attendance from employee microservice.',
          'Falling back to local JSON data.',
          error
        );
        // dataSource stays 'local' — no setAttendance needed.
      }
    };

    void loadAttendance();
  }, []); // run once on mount

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-background-light dark:bg-background-dark px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-border-dark">
        <div>
          <h1 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">
            Attendance
          </h1>
          {/* Data-source badge — helpful during development / QA */}
          {dataSource === 'api' && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              Live data
            </span>
          )}
        </div>
        <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <img src={user.avatarLarge} alt="User" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────────── */}
      <div className="flex bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-border-dark">
        {tabs.map((tab, idx) => (
          <button
            key={tab}
            onClick={() => setActiveTab(idx)}
            className={`flex-1 py-3 border-b-[3px] text-sm font-bold transition-colors ${
              activeTab === idx
                ? 'border-primary text-primary'
                : 'border-transparent text-text-sub-light dark:text-text-sub-dark'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-6">

        {/* ── Month Selector ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <button className="flex items-center gap-2 bg-white dark:bg-card-dark px-3 py-2 rounded-lg border border-gray-200 dark:border-border-dark text-sm font-medium text-text-main-light dark:text-text-main-dark shadow-sm">
            {attendance.currentMonth}
            <span className="material-symbols-outlined text-lg text-text-sub-light dark:text-text-sub-dark">
              expand_more
            </span>
          </button>
          <div className="flex gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">
              <span className="material-symbols-outlined text-text-sub-light dark:text-text-sub-dark">
                chevron_left
              </span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">
              <span className="material-symbols-outlined text-text-sub-light dark:text-text-sub-dark">
                chevron_right
              </span>
            </button>
          </div>
        </div>

        {/* ── Stats Grid ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4">
          {attendance.stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-card-dark p-4 rounded-xl border border-gray-200 dark:border-border-dark shadow-sm"
            >
              <p className="text-sm font-medium text-text-sub-light dark:text-text-sub-dark mb-1">
                {stat.label}
              </p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* ── Daily Records ────────────────────────────────────────────────── */}
        <div>
          <h2 className="text-base font-bold text-text-main-light dark:text-text-main-dark mb-3">
            Daily Records
          </h2>

          {attendance.dailyRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-text-sub-light dark:text-text-sub-dark">
              <span className="material-symbols-outlined text-4xl mb-2 opacity-40">
                event_busy
              </span>
              <p className="text-sm">No records found for this period.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {attendance.dailyRecords.map((record) => (
                <div
                  key={`${record.dayLabel}-${record.date}`}
                  className="bg-white dark:bg-card-dark p-3 rounded-xl border border-gray-200 dark:border-border-dark shadow-sm flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {/* Date badge */}
                    <div
                      className={`flex flex-col items-center justify-center ${record.dateBoxBg} ${record.dateBoxText} rounded-lg w-12 h-14`}
                    >
                      <span className="text-[10px] font-bold uppercase">{record.dayLabel}</span>
                      <span className="text-lg font-bold">{record.date}</span>
                    </div>
                    {/* Shift info */}
                    <div>
                      <p className="font-semibold text-text-main-light dark:text-text-main-dark">
                        {record.shiftName}
                      </p>
                      <p className="text-xs text-text-sub-light dark:text-text-sub-dark">
                        {record.shiftTime}
                      </p>
                    </div>
                  </div>
                  {/* Status */}
                  <div className="text-right">
                    <p className={`font-semibold text-sm ${record.statusColor}`}>
                      {record.status}
                    </p>
                    {record.duration && (
                      <p className="text-xs text-text-sub-light dark:text-text-sub-dark">
                        {record.duration}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Action Buttons ───────────────────────────────────────────────── */}
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
