import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import appData from '../data/appData.json';
import AuthService from '../service/AuthService.js';
import DoctorAppointmentService, { DoctorAppointment } from '../service/DoctorAppointmentService';

// ─── JSON fallback shape (keeps screen usable when API is down) ────────────────

interface FallbackItem {
  id: number | string;
  time: string;
  patientName: string;
  contact: string;
  details: string;
  symptoms: string;
  statusDotColor: string;
  defaultOpen: boolean;
}

const jsonFallback = appData.appointments;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildDetails(appt: DoctorAppointment): string {
  const age = DoctorAppointmentService.calcAge(appt.patientDOB);
  if (appt.patientGender && age !== null) return `${appt.patientGender}, ${age} yrs`;
  if (appt.patientGender) return appt.patientGender;
  return '';
}

function activeSymptoms(appt: DoctorAppointment): string {
  if (!appt.symptoms) return appt.message ?? '';
  const flags: string[] = [];
  const s = appt.symptoms;
  if (s.fever)            flags.push('Fever');
  if (s.cough)            flags.push('Cough');
  if (s.headache)         flags.push('Headache');
  if (s.fatigue)          flags.push('Fatigue');
  if (s.jointPain)        flags.push('Joint Pain');
  if (s.chestPain)        flags.push('Chest Pain');
  if (s.bodyPain)         flags.push('Body Pain');
  if (s.abdominalPain)    flags.push('Abdominal Pain');
  if (s.breathingProblem) flags.push('Breathing Problem');
  if (s.dizziness)        flags.push('Dizziness');
  if (s.nausea)           flags.push('Nausea');
  if (s.vomiting)         flags.push('Vomiting');
  if (s.diarrhea)         flags.push('Diarrhea');
  if (s.skinrash)         flags.push('Skin Rash');
  if (s.otherSymptoms)    flags.push(s.otherSymptoms);
  return flags.join(', ') || appt.message || '';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const Skeleton: React.FC = () => (
  <div className="space-y-4">
    {[1, 2, 3].map(i => (
      <div key={i} className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-border-dark h-24 animate-pulse" />
    ))}
  </div>
);

// ─── Live appointment card ────────────────────────────────────────────────────

interface LiveCardProps {
  appt: DoctorAppointment;
  index: number;
}

const LiveCard: React.FC<LiveCardProps> = ({ appt, index }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(index === 0);
  const dotColor = DoctorAppointmentService.statusDotColor(appt.status);
  const details = buildDetails(appt);
  const symptoms = activeSymptoms(appt);

  return (
    <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-border-dark shadow-sm overflow-hidden">
      {/* Summary row */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-4">
          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor}`} />
          <div>
            <p className="font-bold text-text-main-light dark:text-text-main-dark">
              {DoctorAppointmentService.formatTime(appt.slot)}
            </p>
            <p className="text-sm text-text-sub-light dark:text-text-sub-dark">
              {appt.patientFirstName} {appt.patientLastName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            appt.status === 'Completed'    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
            appt.status === 'In Progress'  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
            appt.status === 'Cancelled'    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                             'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
          }`}>
            {appt.status}
          </span>
          <span className={`material-symbols-outlined text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </div>
      </button>

      {/* Expanded detail panel */}
      {open && (
        <div className="border-t border-gray-100 dark:border-gray-800 p-4 pt-2">
          <div className="grid grid-cols-2 gap-4 mb-4 mt-2">
            <div>
              <p className="text-xs font-bold uppercase text-text-sub-light dark:text-text-sub-dark tracking-wide">Patient</p>
              <p className="font-medium text-text-main-light dark:text-text-main-dark">
                {appt.patientFirstName} {appt.patientLastName}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-text-sub-light dark:text-text-sub-dark tracking-wide">Contact</p>
              <p className="font-medium text-text-main-light dark:text-text-main-dark">{appt.patientMobile || '—'}</p>
            </div>
            {details && (
              <div>
                <p className="text-xs font-bold uppercase text-text-sub-light dark:text-text-sub-dark tracking-wide">Details</p>
                <p className="font-medium text-text-main-light dark:text-text-main-dark">{details}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-bold uppercase text-text-sub-light dark:text-text-sub-dark tracking-wide">Department</p>
              <p className="font-medium text-text-main-light dark:text-text-main-dark">{appt.department}</p>
            </div>
          </div>

          {symptoms && (
            <div className="mb-4">
              <p className="text-xs font-bold uppercase text-text-sub-light dark:text-text-sub-dark tracking-wide mb-1">Symptoms</p>
              <p className="text-sm text-text-main-light dark:text-text-main-dark leading-relaxed">{symptoms}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/appointments/${appt.id}`, { state: { appointment: appt } })}
              className="flex-1 h-10 rounded-lg bg-secondary/10 text-secondary font-bold text-sm active:scale-95 transition-transform"
            >
              View Full Chart
            </button>
            <button
              onClick={() => navigate(`/appointments/${appt.id}`, { state: { appointment: appt, initialTab: 'Consultation' } })}
              className="flex-1 h-10 rounded-lg bg-secondary text-white font-bold text-sm hover:opacity-90 active:scale-95 transition-all"
            >
              Start Consultation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Fallback card (from appData.json) ────────────────────────────────────────

const FallbackCard: React.FC<{ appt: FallbackItem }> = ({ appt }) => (
  <details
    open={appt.defaultOpen}
    className="group bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-border-dark shadow-sm overflow-hidden"
  >
    <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
      <div className="flex items-center gap-4">
        <div className={`w-2 h-2 rounded-full ${appt.statusDotColor}`} />
        <div>
          <p className="font-bold text-text-main-light dark:text-text-main-dark">{appt.time}</p>
          <p className="text-sm text-text-sub-light dark:text-text-sub-dark">{appt.patientName}</p>
        </div>
      </div>
      <span className="material-symbols-outlined text-gray-400 group-open:rotate-180 transition-transform">expand_more</span>
    </summary>
    <div className="border-t border-gray-100 dark:border-gray-800 p-4 pt-2">
      <div className="grid grid-cols-2 gap-4 mb-4 mt-2">
        <div>
          <p className="text-xs font-bold uppercase text-text-sub-light dark:text-text-sub-dark tracking-wide">Patient</p>
          <p className="font-medium text-text-main-light dark:text-text-main-dark">{appt.patientName}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-text-sub-light dark:text-text-sub-dark tracking-wide">Contact</p>
          <p className="font-medium text-text-main-light dark:text-text-main-dark">{appt.contact}</p>
        </div>
        {appt.details && (
          <div className="col-span-2">
            <p className="text-xs font-bold uppercase text-text-sub-light dark:text-text-sub-dark tracking-wide">Details</p>
            <p className="font-medium text-text-main-light dark:text-text-main-dark">{appt.details}</p>
          </div>
        )}
      </div>
      {appt.symptoms && (
        <div className="mb-4">
          <p className="text-xs font-bold uppercase text-text-sub-light dark:text-text-sub-dark tracking-wide mb-1">Symptoms</p>
          <p className="text-sm text-text-main-light dark:text-text-main-dark leading-relaxed">{appt.symptoms}</p>
        </div>
      )}
      <div className="flex gap-3">
        <button className="flex-1 h-10 rounded-lg bg-secondary/10 text-secondary font-bold text-sm">View Full Chart</button>
        <button className="flex-1 h-10 rounded-lg bg-secondary text-white font-bold text-sm">Start Consultation</button>
      </div>
    </div>
  </details>
);

// ─── Main screen ──────────────────────────────────────────────────────────────

type DateFilter = 'today' | 'all';

const Appointments: React.FC = () => {
  const navigate = useNavigate();

  const [allAppointments, setAllAppointments] = useState<DoctorAppointment[]>([]);
  const [dataSource, setDataSource]           = useState<'api' | 'local'>('local');
  const [dateFilter, setDateFilter]           = useState<DateFilter>('today');
  const [loading, setLoading]                 = useState(true);

  useEffect(() => {
    const load = async () => {
      const doctorName = AuthService.getName();
      const hospitalId = AuthService.getHospitalId();
      if (!doctorName) { setLoading(false); return; }
      try {
        const data = await DoctorAppointmentService.getAppointmentsByDoctor(doctorName, hospitalId ?? undefined);
        data.sort((a, b) => {
          const dc = (b.appointmentDate ?? '').localeCompare(a.appointmentDate ?? '');
          return dc !== 0 ? dc : (a.slot ?? '').localeCompare(b.slot ?? '');
        });
        setAllAppointments(data);
        setDataSource('api');
      } catch (err) {
        console.warn('[Appointments] API failed, using local JSON fallback.', err);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const displayed: DoctorAppointment[] =
    dateFilter === 'today'
      ? DoctorAppointmentService.filterToday(allAppointments)
      : allAppointments;

  const headerDate =
    dateFilter === 'today'
      ? DoctorAppointmentService.formatDate(new Date().toISOString().split('T')[0])
      : 'All Appointments';

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
          <h1 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">My Appointments</h1>
          <div className="flex items-center justify-center gap-1.5">
            <p className="text-sm text-text-sub-light dark:text-text-sub-dark">{headerDate}</p>
            {dataSource === 'api' && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                Live
              </span>
            )}
          </div>
        </div>

        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
          <span className="material-symbols-outlined text-gray-400 text-xl">person</span>
        </div>
      </div>

      {/* ── Date filter tabs (only when live data is available) ──────────────── */}
      {dataSource === 'api' && (
        <div className="flex gap-2 px-4 pt-3">
          {(['today', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setDateFilter(f)}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${
                dateFilter === f
                  ? 'bg-secondary text-white'
                  : 'bg-white dark:bg-card-dark text-text-sub-light dark:text-text-sub-dark border border-gray-200 dark:border-border-dark'
              }`}
            >
              {f === 'today' ? 'Today' : 'All'}
            </button>
          ))}
        </div>
      )}

      {/* ── Appointment list ─────────────────────────────────────────────────── */}
      <main className="flex-1 p-4 space-y-4">
        {loading && <Skeleton />}

        {/* Live data */}
        {!loading && dataSource === 'api' && (
          displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-text-sub-light dark:text-text-sub-dark">
              <span className="material-symbols-outlined text-5xl mb-3 opacity-40">event_available</span>
              <p className="text-sm font-medium">
                {dateFilter === 'today' ? 'No appointments scheduled for today.' : 'No appointments found.'}
              </p>
            </div>
          ) : (
            displayed.map((appt, i) => <LiveCard key={appt.id} appt={appt} index={i} />)
          )
        )}

        {/* Fallback data */}
        {!loading && dataSource === 'local' && (
          jsonFallback.list.map(appt => (
            <FallbackCard key={appt.id} appt={appt as FallbackItem} />
          ))
        )}
      </main>
    </div>
  );
};

export default Appointments;