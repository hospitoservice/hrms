import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import appData from '../data/appData.json';
import AppointmentsServiceInstance from '../service/AppointmentsService.js';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AppointmentItem {
  id:             number | string;
  time:           string;
  patientName:    string;
  contact:        string;
  details:        string;
  symptoms:       string;
  statusDotColor: string;
  defaultOpen:    boolean;
}

interface AppointmentsData {
  date: string;
  list: AppointmentItem[];
}

// ─── JSON fallback ────────────────────────────────────────────────────────────
// Seed state with local data so the screen is always immediately usable,
// even before the network call completes or if it fails entirely.

const jsonFallback: AppointmentsData = {
  date: appData.appointments.date,
  list: appData.appointments.list,
};

const { user } = appData;

// ─── Component ────────────────────────────────────────────────────────────────

const Appointments = () => {
  const navigate = useNavigate();

  // Start with JSON data — screen renders instantly on every load.
  const [appointmentsData, setAppointmentsData] = useState<AppointmentsData>(jsonFallback);
  const [dataSource, setDataSource]             = useState<'api' | 'local'>('local');

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        // Attempt to fetch live data from the employee microservice.
        const apiData: AppointmentsData = await AppointmentsServiceInstance.getAppointments(
          user.staffId
        );
        setAppointmentsData(apiData);
        setDataSource('api');
      } catch (error) {
        // Network failure, non-2xx response, or any other runtime error.
        // State is already seeded with JSON data — screen stays fully functional.
        console.warn(
          '[Appointments] Could not load appointments from employee microservice.',
          'Falling back to local JSON data.',
          error
        );
        // dataSource stays 'local' — no setAppointmentsData needed.
      }
    };

    void loadAppointments();
  }, []); // run once on mount

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => navigate('/')}
          className="w-10 h-10 flex items-center justify-center text-text-main-light dark:text-text-main-dark"
        >
          <span className="material-symbols-outlined text-2xl">calendar_month</span>
        </button>

        <div className="text-center">
          <h1 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">
            Today's Appointments
          </h1>
          <div className="flex items-center justify-center gap-1.5">
            <p className="text-sm text-text-sub-light dark:text-text-sub-dark">
              {appointmentsData.date}
            </p>
            {/* Data-source badge — helpful during development / QA */}
            {dataSource === 'api' && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                Live
              </span>
            )}
          </div>
        </div>

        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
          <img
            src={user.avatarAppointments}
            alt="Dr Profile"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* ── Appointment List ─────────────────────────────────────────────────── */}
      <main className="flex-1 p-4 space-y-4">
        {appointmentsData.list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-text-sub-light dark:text-text-sub-dark">
            <span className="material-symbols-outlined text-5xl mb-3 opacity-40">
              event_available
            </span>
            <p className="text-sm font-medium">No appointments scheduled for today.</p>
          </div>
        ) : (
          appointmentsData.list.map((appt) => (
            <details
              key={appt.id}
              open={appt.defaultOpen}
              className="group bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-border-dark shadow-sm overflow-hidden"
            >
              {/* ── Summary row (always visible) ─────────────────────────── */}
              <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${appt.statusDotColor}`}></div>
                  <div>
                    <p className="font-bold text-text-main-light dark:text-text-main-dark">
                      {appt.time}
                    </p>
                    <p className="text-sm text-text-sub-light dark:text-text-sub-dark">
                      {appt.patientName}
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-gray-400 group-open:rotate-180 transition-transform">
                  expand_more
                </span>
              </summary>

              {/* ── Expanded detail panel ────────────────────────────────── */}
              <div className="border-t border-gray-100 dark:border-gray-800 p-4 pt-2">
                <div className="grid grid-cols-2 gap-4 mb-4 mt-2">
                  <div>
                    <p className="text-xs font-bold uppercase text-text-sub-light dark:text-text-sub-dark tracking-wide">
                      Patient
                    </p>
                    <p className="font-medium text-text-main-light dark:text-text-main-dark">
                      {appt.patientName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase text-text-sub-light dark:text-text-sub-dark tracking-wide">
                      Contact
                    </p>
                    <p className="font-medium text-text-main-light dark:text-text-main-dark">
                      {appt.contact}
                    </p>
                  </div>
                  {appt.details && (
                    <div className="col-span-2">
                      <p className="text-xs font-bold uppercase text-text-sub-light dark:text-text-sub-dark tracking-wide">
                        Details
                      </p>
                      <p className="font-medium text-text-main-light dark:text-text-main-dark">
                        {appt.details}
                      </p>
                    </div>
                  )}
                </div>

                {appt.symptoms && (
                  <div className="mb-4">
                    <p className="text-xs font-bold uppercase text-text-sub-light dark:text-text-sub-dark tracking-wide mb-1">
                      Symptoms
                    </p>
                    <p className="text-sm text-text-main-light dark:text-text-main-dark leading-relaxed">
                      {appt.symptoms}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button className="flex-1 h-10 rounded-lg bg-primary/10 text-primary font-bold text-sm">
                    View Full Chart
                  </button>
                  <button className="flex-1 h-10 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-colors">
                    Start Consultation
                  </button>
                </div>
              </div>
            </details>
          ))
        )}
      </main>
    </div>
  );
};

export default Appointments;
