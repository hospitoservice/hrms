/**
 * DoctorAppointmentService
 *
 * Fetches appointments from the appointment microservice (GraphQL) using
 * the logged-in doctor's name as the lookup key.
 *
 * The Vite proxy rewrites /appointment/* → http://appointment-service:8080/*
 * so all calls use the relative path /appointment/graphql.
 */

const APPOINTMENT_GRAPHQL = '/appointment/graphql';

// ── GraphQL helpers ────────────────────────────────────────────────────────────

async function gql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(APPOINTMENT_GRAPHQL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GraphQL HTTP error ${res.status}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0].message);
  return json.data as T;
}

// ── Types ──────────────────────────────────────────────────────────────────────

export interface DoctorAppointmentVitals {
  height?: string;
  weight?: string;
  bmi?: string;
  temperature?: string;
  heartRate?: string;
  spo2?: string;
  bloodGroup?: string;
  bloodPressure?: string;
  condition?: string;
}

export interface DoctorAppointmentSymptoms {
  fever?: boolean;
  cough?: boolean;
  headache?: boolean;
  fatigue?: boolean;
  jointPain?: boolean;
  chestPain?: boolean;
  bodyPain?: boolean;
  abdominalPain?: boolean;
  hairloss?: boolean;
  breathingProblem?: boolean;
  nightSweats?: boolean;
  infection?: boolean;
  vomiting?: boolean;
  diarrhea?: boolean;
  constipation?: boolean;
  dizziness?: boolean;
  skinrash?: boolean;
  nausea?: boolean;
  otherSymptoms?: string;
}

export interface DoctorAppointmentMedicine {
  id?: string;
  medicineName?: string;
  medicineCategory?: string;
  medicineDosage?: string;
  medicineFrequency?: string;
  medicineDuration?: string;
  description?: string;
}

export interface DoctorAppointmentTestReport {
  id?: string;
  testName?: string;
  testCategory?: string;
  report?: string;
  testStatus?: string;
  testAssignedDate?: string;
  testPerformedDate?: string;
  reportDate?: string;
}

export interface DoctorAppointment {
  id: string;
  patientId: string;
  patientFirstName: string;
  patientLastName: string;
  patientGender: string;
  patientMobile: string;
  patientEmail: string;
  patientDOB: string;
  department: string;
  doctor?: string;
  appointmentDate: string;
  slot: string;
  status: string;
  message?: string;
  doctorComments?: string;
  vitals?: DoctorAppointmentVitals;
  symptoms?: DoctorAppointmentSymptoms;
  medicine?: DoctorAppointmentMedicine[];
  testsAndReports?: DoctorAppointmentTestReport[];
}

// ── Queries ────────────────────────────────────────────────────────────────────

const GET_APPOINTMENTS_BY_DOCTOR_AND_HOSPITAL = `
  query GetAppointmentsByDoctorAndHospitalId($doctor: String!, $hospitalId: String!) {
    getAppointmentsByDoctorAndHospitalId(doctor: $doctor, hospitalId: $hospitalId) {
      id
      patientId
      patientFirstName
      patientLastName
      patientGender
      patientMobile
      patientEmail
      patientDOB
      department
      doctor
      appointmentDate
      slot
      status
      message
      doctorComments
      vitals {
        height weight bmi temperature heartRate spo2 bloodGroup bloodPressure condition
      }
      symptoms {
        fever cough headache fatigue jointPain chestPain bodyPain abdominalPain
        hairloss breathingProblem nightSweats infection vomiting diarrhea
        constipation dizziness skinrash nausea otherSymptoms
      }
      medicine {
        id medicineName medicineCategory medicineDosage medicineFrequency medicineDuration description
      }
      testsAndReports {
        id testName testCategory report testStatus testAssignedDate testPerformedDate reportDate
      }
    }
  }
`;

// ── Public API ─────────────────────────────────────────────────────────────────

const DoctorAppointmentService = {
  /**
   * Fetches all appointments for the given doctor name scoped to their hospital.
   * Falls back to unscoped query when hospitalId is absent (shouldn't happen in practice).
   */
  async getAppointmentsByDoctor(doctorName: string, hospitalId?: string): Promise<DoctorAppointment[]> {
    const data = await gql<{ getAppointmentsByDoctorAndHospitalId: DoctorAppointment[] }>(
      GET_APPOINTMENTS_BY_DOCTOR_AND_HOSPITAL,
      { doctor: doctorName, hospitalId: hospitalId ?? '' }
    );
    return data.getAppointmentsByDoctorAndHospitalId ?? [];
  },

  /** Returns appointments for today only (ISO date "YYYY-MM-DD"). */
  filterToday(appointments: DoctorAppointment[]): DoctorAppointment[] {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(a => a.appointmentDate === today);
  },

  /** Formats an ISO date string ("2026-06-06") for display ("June 6, 2026"). */
  formatDate(isoDate?: string): string {
    if (!isoDate) return '';
    const d = new Date(isoDate + 'T00:00:00');
    if (isNaN(d.getTime())) return isoDate;
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  },

  /** Formats a time scalar ("10:30:00") to display format ("10:30 AM"). */
  formatTime(timeStr?: string): string {
    if (!timeStr) return '';
    if (/[ap]m/i.test(timeStr)) return timeStr;
    const parts = timeStr.split(':').map(Number);
    if (parts.length < 2 || parts.some(isNaN)) return timeStr;
    const [hours, minutes] = parts;
    const period = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    const m = String(minutes).padStart(2, '0');
    return `${h}:${m} ${period}`;
  },

  /** Maps appointment status to a Tailwind dot-colour class. */
  statusDotColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'scheduled':   return 'bg-blue-500';
      case 'in progress': return 'bg-amber-500';
      case 'completed':   return 'bg-green-500';
      case 'cancelled':   return 'bg-red-400';
      default:            return 'bg-gray-400';
    }
  },

  /** Returns a human-readable patient age from DOB ("YYYY-MM-DD"). */
  calcAge(dob?: string): number | null {
    if (!dob) return null;
    const birth = new Date(dob + 'T00:00:00');
    if (isNaN(birth.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  },
};

export default DoctorAppointmentService;