import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DoctorAppointmentService, {
  DoctorAppointment,
  DoctorAppointmentVitals,
  DoctorAppointmentSymptoms,
  DoctorAppointmentMedicine,
  DoctorAppointmentTestReport,
} from '../service/DoctorAppointmentService';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'Overview' | 'Vitals' | 'Symptoms' | 'Consultation' | 'Medicines' | 'Reports';

interface LocationState {
  appointment: DoctorAppointment;
  initialTab?: Tab;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const InfoRow: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
  <div className="py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
    <p className="text-xs font-bold uppercase text-text-sub-light dark:text-text-sub-dark tracking-wide mb-0.5">{label}</p>
    <p className="text-sm font-medium text-text-main-light dark:text-text-main-dark">{value || '—'}</p>
  </div>
);

const SectionCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-white dark:bg-card-dark rounded-xl border border-gray-100 dark:border-border-dark shadow-sm p-4 mb-3">
    {children}
  </div>
);

const EmptyState: React.FC<{ icon: string; label: string }> = ({ icon, label }) => (
  <div className="flex flex-col items-center py-16 text-center">
    <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-5xl mb-3">{icon}</span>
    <p className="text-sm text-text-sub-light dark:text-text-sub-dark font-medium">{label}</p>
  </div>
);

// ── Tab content components ─────────────────────────────────────────────────────

const OverviewTab: React.FC<{ appt: DoctorAppointment }> = ({ appt }) => {
  const age = DoctorAppointmentService.calcAge(appt.patientDOB);
  return (
    <>
      {/* Patient info */}
      <SectionCard>
        <p className="text-xs font-bold uppercase text-text-sub-light dark:text-text-sub-dark tracking-wide mb-3">Patient Information</p>
        <InfoRow label="Full Name"   value={`${appt.patientFirstName} ${appt.patientLastName}`} />
        <InfoRow label="Patient ID"  value={appt.patientId} />
        <InfoRow label="Gender"      value={appt.patientGender} />
        <InfoRow label="Age"         value={age !== null ? `${age} years` : undefined} />
        <InfoRow label="Date of Birth" value={DoctorAppointmentService.formatDate(appt.patientDOB)} />
        <InfoRow label="Mobile"      value={appt.patientMobile} />
        <InfoRow label="Email"       value={appt.patientEmail} />
      </SectionCard>

      {/* Appointment info */}
      <SectionCard>
        <p className="text-xs font-bold uppercase text-text-sub-light dark:text-text-sub-dark tracking-wide mb-3">Appointment Details</p>
        <InfoRow label="Date"        value={DoctorAppointmentService.formatDate(appt.appointmentDate)} />
        <InfoRow label="Time"        value={DoctorAppointmentService.formatTime(appt.slot)} />
        <InfoRow label="Department"  value={appt.department} />
        <InfoRow label="Doctor"      value={appt.doctor} />
        <InfoRow label="Status"      value={appt.status} />
        {appt.message && <InfoRow label="Patient Note" value={appt.message} />}
      </SectionCard>
    </>
  );
};

const VitalsTab: React.FC<{ vitals?: DoctorAppointmentVitals }> = ({ vitals }) => {
  if (!vitals || Object.values(vitals).every(v => !v)) {
    return <EmptyState icon="monitor_heart" label="Vitals not recorded yet" />;
  }
  return (
    <SectionCard>
      <p className="text-xs font-bold uppercase text-text-sub-light dark:text-text-sub-dark tracking-wide mb-3">Vital Signs</p>
      {vitals.bloodPressure  && <InfoRow label="Blood Pressure"  value={vitals.bloodPressure} />}
      {vitals.heartRate      && <InfoRow label="Heart Rate"      value={`${vitals.heartRate} bpm`} />}
      {vitals.temperature    && <InfoRow label="Temperature"     value={`${vitals.temperature} °F`} />}
      {vitals.spo2           && <InfoRow label="SpO2"            value={`${vitals.spo2}%`} />}
      {vitals.height         && <InfoRow label="Height"          value={vitals.height} />}
      {vitals.weight         && <InfoRow label="Weight"          value={vitals.weight} />}
      {vitals.bmi            && <InfoRow label="BMI"             value={vitals.bmi} />}
      {vitals.bloodGroup     && <InfoRow label="Blood Group"     value={vitals.bloodGroup} />}
      {vitals.condition      && <InfoRow label="Condition"       value={vitals.condition} />}
    </SectionCard>
  );
};

const SymptomsTab: React.FC<{ symptoms?: DoctorAppointmentSymptoms }> = ({ symptoms }) => {
  if (!symptoms) return <EmptyState icon="sick" label="Symptoms not recorded yet" />;

  const active: string[] = [];
  if (symptoms.fever)            active.push('Fever');
  if (symptoms.cough)            active.push('Cough');
  if (symptoms.headache)         active.push('Headache');
  if (symptoms.fatigue)          active.push('Fatigue');
  if (symptoms.jointPain)        active.push('Joint Pain');
  if (symptoms.chestPain)        active.push('Chest Pain');
  if (symptoms.bodyPain)         active.push('Body Pain');
  if (symptoms.abdominalPain)    active.push('Abdominal Pain');
  if (symptoms.hairloss)         active.push('Hair Loss');
  if (symptoms.breathingProblem) active.push('Breathing Problem');
  if (symptoms.nightSweats)      active.push('Night Sweats');
  if (symptoms.infection)        active.push('Infection');
  if (symptoms.vomiting)         active.push('Vomiting');
  if (symptoms.diarrhea)         active.push('Diarrhea');
  if (symptoms.constipation)     active.push('Constipation');
  if (symptoms.dizziness)        active.push('Dizziness');
  if (symptoms.skinrash)         active.push('Skin Rash');
  if (symptoms.nausea)           active.push('Nausea');

  if (active.length === 0 && !symptoms.otherSymptoms) {
    return <EmptyState icon="sick" label="No symptoms recorded" />;
  }

  return (
    <SectionCard>
      <p className="text-xs font-bold uppercase text-text-sub-light dark:text-text-sub-dark tracking-wide mb-3">Reported Symptoms</p>
      {active.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {active.map(s => (
            <span key={s} className="px-3 py-1 rounded-full text-xs font-bold bg-secondary/10 text-secondary">
              {s}
            </span>
          ))}
        </div>
      )}
      {symptoms.otherSymptoms && (
        <div className="mt-2 pt-3 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs font-bold uppercase text-text-sub-light dark:text-text-sub-dark tracking-wide mb-1">Other</p>
          <p className="text-sm text-text-main-light dark:text-text-main-dark">{symptoms.otherSymptoms}</p>
        </div>
      )}
    </SectionCard>
  );
};

const ConsultationTab: React.FC<{ comments?: string }> = ({ comments }) => {
  if (!comments) {
    return <EmptyState icon="clinical_notes" label="No consultation notes yet" />;
  }
  return (
    <SectionCard>
      <p className="text-xs font-bold uppercase text-text-sub-light dark:text-text-sub-dark tracking-wide mb-3">Doctor's Notes</p>
      <p className="text-sm text-text-main-light dark:text-text-main-dark leading-relaxed whitespace-pre-wrap">{comments}</p>
    </SectionCard>
  );
};

const MedicinesTab: React.FC<{ medicines?: DoctorAppointmentMedicine[] }> = ({ medicines }) => {
  if (!medicines?.length) return <EmptyState icon="medication" label="No medicines prescribed" />;
  return (
    <div className="space-y-3">
      {medicines.map((m, i) => (
        <SectionCard key={m.id ?? i}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-secondary text-xl">medication</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-text-main-light dark:text-text-main-dark">{m.medicineName || '—'}</p>
              {m.medicineCategory && (
                <p className="text-xs text-text-sub-light dark:text-text-sub-dark mt-0.5">{m.medicineCategory}</p>
              )}
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                {m.medicineDosage    && <span className="text-xs text-text-sub-light dark:text-text-sub-dark">Dosage: <b className="text-text-main-light dark:text-text-main-dark">{m.medicineDosage}</b></span>}
                {m.medicineFrequency && <span className="text-xs text-text-sub-light dark:text-text-sub-dark">Freq: <b className="text-text-main-light dark:text-text-main-dark">{m.medicineFrequency}</b></span>}
                {m.medicineDuration  && <span className="text-xs text-text-sub-light dark:text-text-sub-dark">Duration: <b className="text-text-main-light dark:text-text-main-dark">{m.medicineDuration}</b></span>}
              </div>
              {m.description && (
                <p className="text-xs text-text-sub-light dark:text-text-sub-dark mt-1">{m.description}</p>
              )}
            </div>
          </div>
        </SectionCard>
      ))}
    </div>
  );
};

const ReportsTab: React.FC<{ reports?: DoctorAppointmentTestReport[] }> = ({ reports }) => {
  if (!reports?.length) return <EmptyState icon="science" label="No lab reports ordered" />;

  const STATUS_STYLE: Record<string, string> = {
    Pending:       'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'In Progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Completed:     'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  };

  return (
    <div className="space-y-3">
      {reports.map((r, i) => {
        const statusStyle = STATUS_STYLE[r.testStatus ?? ''] ?? 'bg-gray-100 text-gray-600';
        return (
          <SectionCard key={r.id ?? i}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="font-bold text-text-main-light dark:text-text-main-dark">{r.testName || 'Lab Test'}</p>
              {r.testStatus && (
                <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${statusStyle}`}>
                  {r.testStatus}
                </span>
              )}
            </div>
            {r.testCategory && (
              <p className="text-xs text-text-sub-light dark:text-text-sub-dark mb-2">{r.testCategory}</p>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-sub-light dark:text-text-sub-dark">
              {r.testAssignedDate  && <span>Assigned: {DoctorAppointmentService.formatDate(r.testAssignedDate)}</span>}
              {r.testPerformedDate && <span>Performed: {DoctorAppointmentService.formatDate(r.testPerformedDate)}</span>}
              {r.reportDate        && <span>Report: {DoctorAppointmentService.formatDate(r.reportDate)}</span>}
            </div>
            {r.report && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs font-bold uppercase text-text-sub-light dark:text-text-sub-dark tracking-wide mb-1">Report</p>
                <p className="text-sm text-text-main-light dark:text-text-main-dark">{r.report}</p>
              </div>
            )}
          </SectionCard>
        );
      })}
    </div>
  );
};

// ─── Main screen ──────────────────────────────────────────────────────────────

const TABS: Tab[] = ['Overview', 'Vitals', 'Symptoms', 'Consultation', 'Medicines', 'Reports'];

const TAB_ICONS: Record<Tab, string> = {
  Overview:     'person',
  Vitals:       'monitor_heart',
  Symptoms:     'sick',
  Consultation: 'clinical_notes',
  Medicines:    'medication',
  Reports:      'science',
};

const AppointmentDetail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const appt = state?.appointment;
  const [activeTab, setActiveTab] = useState<Tab>(state?.initialTab ?? 'Overview');

  if (!appt) {
    return (
      <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark items-center justify-center p-8 text-center">
        <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-4">error_outline</span>
        <p className="text-text-sub-light dark:text-text-sub-dark mb-6">Appointment data not found.</p>
        <button
          onClick={() => navigate('/appointments')}
          className="px-6 py-2 bg-secondary text-white rounded-lg font-bold"
        >
          Back to Appointments
        </button>
      </div>
    );
  }

  const statusBadgeStyle =
    appt.status === 'Completed'   ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
    appt.status === 'In Progress' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
    appt.status === 'Cancelled'   ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-8">

      {/* ── Sticky header ───────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-gray-700">
        {/* Back + title row */}
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white dark:bg-card-dark border border-gray-200 dark:border-border-dark shadow-sm active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined text-text-main-light dark:text-text-main-dark">arrow_back</span>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-text-main-light dark:text-text-main-dark truncate">
              {appt.patientFirstName} {appt.patientLastName}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-text-sub-light dark:text-text-sub-dark">
                {DoctorAppointmentService.formatDate(appt.appointmentDate)} · {DoctorAppointmentService.formatTime(appt.slot)}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadgeStyle}`}>
                {appt.status}
              </span>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex overflow-x-auto px-4 pb-0 gap-1 hide-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'border-secondary text-secondary'
                  : 'border-transparent text-text-sub-light dark:text-text-sub-dark'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{TAB_ICONS[tab]}</span>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ─────────────────────────────────────────────────────── */}
      <div className="flex-1 p-4">
        {activeTab === 'Overview'     && <OverviewTab     appt={appt} />}
        {activeTab === 'Vitals'       && <VitalsTab       vitals={appt.vitals} />}
        {activeTab === 'Symptoms'     && <SymptomsTab     symptoms={appt.symptoms} />}
        {activeTab === 'Consultation' && <ConsultationTab comments={appt.doctorComments} />}
        {activeTab === 'Medicines'    && <MedicinesTab    medicines={appt.medicine} />}
        {activeTab === 'Reports'      && <ReportsTab      reports={appt.testsAndReports} />}
      </div>
    </div>
  );
};

export default AppointmentDetail;