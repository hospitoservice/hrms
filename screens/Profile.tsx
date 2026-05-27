import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import appData from '../data/appData.json';
import EmployeeProfileService from '../service/EmployeeProfile.js';
import AuthService from '../service/AuthService.js';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileData {
  fullName:       string;
  staffId:        string;
  avatarLarge:    string;
  // Medical Credentials
  designation:    string;
  workplace:      string;
  medicalLicense: string;
  department:     string;
  dateOfJoining:  string;
  // Contact Information
  workEmail:         string;
  workPhone:         string;
  emergencyContact:  string;
  // Personal Information
  dateOfBirth:   string;
  homeAddress:   string;
  personalEmail: string;
}

// ─── JSON fallback ────────────────────────────────────────────────────────────
// Seed state with local data so the screen is always immediately usable,
// even before the network call completes or if it fails entirely.

const jsonFallback: ProfileData = {
  fullName:        appData.user.fullName,
  staffId:         appData.user.staffId,
  avatarLarge:     appData.user.avatarLarge,
  designation:     appData.user.designation,
  workplace:       appData.user.workplace,
  medicalLicense:  appData.user.medicalLicense,
  department:      appData.user.department,
  dateOfJoining:   appData.user.dateOfJoining,
  workEmail:       appData.user.workEmail,
  workPhone:       appData.user.workPhone,
  emergencyContact: appData.user.emergencyContact,
  dateOfBirth:     appData.user.dateOfBirth,
  homeAddress:     appData.user.homeAddress,
  personalEmail:   appData.user.personalEmail,
};

// ─── Component ────────────────────────────────────────────────────────────────

const Profile = () => {
  const navigate = useNavigate();

  // Start with JSON data so the screen renders instantly.
  const [profile, setProfile] = useState<ProfileData>(jsonFallback);
  const [dataSource, setDataSource] = useState<'api' | 'local'>('local');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Attempt to fetch live data from the employee microservice.
        const apiData: ProfileData = await EmployeeProfileService.getProfile(
          jsonFallback.staffId
        );
        setProfile(apiData);
        setDataSource('api');
      } catch (error) {
        // Network failure, non-2xx response, or any other runtime error.
        // The state is already seeded with JSON data, so the screen stays
        // fully functional — we just log the reason for the fallback.
        console.warn(
          '[Profile] Could not load profile from employee microservice.',
          'Falling back to local JSON data.',
          error
        );
        // dataSource stays 'local' — no setProfile needed.
      }
    };

    void loadProfile();
  }, []); // run once on mount

  // ── Derived display arrays (rebuilt whenever `profile` changes) ────────────

  const medicalCredentials: [string, string][] = [
    ['Designation',     profile.designation   ],
    ['Workplace',       profile.workplace     ],
    ['Medical License', profile.medicalLicense],
    ['Department',      profile.department    ],
    ['Date of Joining', profile.dateOfJoining ],
  ];

  const contactInfo = [
    { icon: 'mail',              label: 'Work Email',        value: profile.workEmail        },
    { icon: 'call',              label: 'Work Phone',        value: profile.workPhone        },
    { icon: 'contact_emergency', label: 'Emergency Contact', value: profile.emergencyContact },
  ];

  const personalInfo: [string, string][] = [
    ['Date of Birth',  profile.dateOfBirth  ],
    ['Home Address',   profile.homeAddress  ],
    ['Personal Email', profile.personalEmail],
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24">

      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-border-dark">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <span className="material-symbols-outlined text-text-main-light dark:text-text-main-dark">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">My Profile</h1>
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <span className="material-symbols-outlined text-text-main-light dark:text-text-main-dark">more_vert</span>
        </button>
      </div>

      {/* ── Avatar & Name ───────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center pt-8 pb-6 px-4">
        <div
          className="w-32 h-32 rounded-full bg-cover bg-center ring-4 ring-primary/20 mb-4"
          style={{ backgroundImage: `url("${profile.avatarLarge}")` }}
        ></div>
        <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">
          {profile.fullName}
        </h2>
        <p className="text-text-sub-light dark:text-text-sub-dark mt-1">ID: {profile.staffId}</p>

        {/* Data-source badge — helpful during development / QA */}
        {dataSource === 'api' && (
          <span className="mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Live data
          </span>
        )}
      </div>

      {/* ── Info Cards ──────────────────────────────────────────────────────── */}
      <div className="px-4 space-y-6">

        {/* Medical Credentials */}
        <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm overflow-hidden">
          <div className="p-4">
            <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">
              Medical Credentials
            </h3>
            <p className="text-sm text-text-sub-light dark:text-text-sub-dark mt-1">
              Professional designation and qualifications.
            </p>
          </div>
          <div className="px-4 pb-2 space-y-4">
            {medicalCredentials.map(([label, value]) => (
              <div key={label} className="flex justify-between py-3 border-t border-gray-100 dark:border-border-dark">
                <span className="text-sm text-text-sub-light dark:text-text-sub-dark">{label}</span>
                <span className="text-sm font-medium text-text-main-light dark:text-text-main-dark text-right">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm overflow-hidden">
          <div className="p-4">
            <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">
              Contact Information
            </h3>
            <p className="text-sm text-text-sub-light dark:text-text-sub-dark mt-1">
              Professional and emergency contacts.
            </p>
          </div>
          <div className="px-4 pb-2">
            {contactInfo.map((item, idx) => (
              <div key={idx} className="flex items-center py-4 border-t border-gray-100 dark:border-border-dark">
                <span className="material-symbols-outlined text-text-sub-light dark:text-text-sub-dark mr-4">
                  {item.icon}
                </span>
                <div>
                  <p className="text-xs text-text-sub-light dark:text-text-sub-dark">{item.label}</p>
                  <p className="text-sm font-medium text-text-main-light dark:text-text-main-dark">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm overflow-hidden">
          <div className="p-4">
            <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">
              Personal Information
            </h3>
            <p className="text-sm text-text-sub-light dark:text-text-sub-dark mt-1">
              Private and personal details.
            </p>
          </div>
          <div className="px-4 pb-2 space-y-4">
            {personalInfo.map(([label, value]) => (
              <div key={label} className="flex justify-between py-3 border-t border-gray-100 dark:border-border-dark">
                <span className="text-sm text-text-sub-light dark:text-text-sub-dark">{label}</span>
                <span className="text-sm font-medium text-text-main-light dark:text-text-main-dark text-right truncate max-w-[60%]">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Logout Button ───────────────────────────────────────────────────── */}
      <div className="px-4 pt-2 pb-6">
        <button
          onClick={() => {
            AuthService.logout();
            navigate('/login', { replace: true });
          }}
          className="
            w-full flex items-center justify-center gap-2
            py-3.5 rounded-xl font-semibold text-sm
            text-red-600 dark:text-red-400
            border border-red-200 dark:border-red-800
            bg-red-50 dark:bg-red-900/20
            hover:bg-red-100 dark:hover:bg-red-900/40
            active:scale-[0.98] transition-all
          "
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Log Out
        </button>
      </div>

      {/* ── Edit FAB ────────────────────────────────────────────────────────── */}
      <button className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-xl flex items-center justify-center hover:bg-primary-dark transition-colors z-20">
        <span className="material-symbols-outlined text-2xl">edit</span>
      </button>

    </div>
  );
};

export default Profile;