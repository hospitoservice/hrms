import React from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24">
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-border-dark">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <span className="material-symbols-outlined text-text-main-light dark:text-text-main-dark">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">My Profile</h1>
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <span className="material-symbols-outlined text-text-main-light dark:text-text-main-dark">more_vert</span>
        </button>
      </div>

      <div className="flex flex-col items-center pt-8 pb-6 px-4">
        <div 
          className="w-32 h-32 rounded-full bg-cover bg-center ring-4 ring-primary/20 mb-4"
          style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBMomu9Jk8qUuBa7xkYJAoQLnUIAWOmjqErLrwkbIL4CyX-_2pw3rx6koOuzIp0pwOd-QYt85koNeW6E2iuXGA9d7YlfDdpQYb78mevDHo0wwFF_UvzKBdUhB03PdLqA5mJ5wHI_bVDJ_1fONX8V5VQKDjYd6bxu0qkQLtd9laMiJgNhf06ByMkjItlhl1cVChlbiauqR5g6ZCsCNe5er5-43vM5rmZ88_l0nNky7a3KNbNDzDnIsJD7k1azaolTHmgDP60z-gG_mo")' }}
        ></div>
        <h2 className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">Dr. Sumedha Tiwari, MD</h2>
        <p className="text-text-sub-light dark:text-text-sub-dark mt-1">ID: DOC56789</p>
      </div>

      <div className="px-4 space-y-6">
        {/* Credentials Card */}
        <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm overflow-hidden">
          <div className="p-4">
            <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">Medical Credentials</h3>
            <p className="text-sm text-text-sub-light dark:text-text-sub-dark mt-1">Professional designation and qualifications.</p>
          </div>
          <div className="px-4 pb-2 space-y-4">
            {[
              ['Designation', 'Psychiatrist'],
              ['Workplace', 'SBS Hospital'],
              ['Medical License', 'MG-45892'],
              ['Department', 'Psychiatry'],
              ['Date of Joining', '15 Jan 2021']
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-3 border-t border-gray-100 dark:border-border-dark">
                <span className="text-sm text-text-sub-light dark:text-text-sub-dark">{label}</span>
                <span className="text-sm font-medium text-text-main-light dark:text-text-main-dark text-right">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm overflow-hidden">
          <div className="p-4">
            <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">Contact Information</h3>
            <p className="text-sm text-text-sub-light dark:text-text-sub-dark mt-1">Professional and emergency contacts.</p>
          </div>
          <div className="px-4 pb-2">
             {[
               { icon: 'mail', label: 'Work Email', value: 'info@drsumedhatiwari.com' },
               { icon: 'call', label: 'Work Phone', value: '+91 9876543210' },
               { icon: 'contact_emergency', label: 'Emergency Contact', value: 'Marcus Vance - (415) 555-0124' }
             ].map((item, idx) => (
                <div key={idx} className="flex items-center py-4 border-t border-gray-100 dark:border-border-dark">
                  <span className="material-symbols-outlined text-text-sub-light dark:text-text-sub-dark mr-4">{item.icon}</span>
                  <div>
                    <p className="text-xs text-text-sub-light dark:text-text-sub-dark">{item.label}</p>
                    <p className="text-sm font-medium text-text-main-light dark:text-text-main-dark">{item.value}</p>
                  </div>
                </div>
             ))}
          </div>
        </div>

         {/* Personal Info */}
         <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm overflow-hidden">
          <div className="p-4">
            <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">Personal Information</h3>
            <p className="text-sm text-text-sub-light dark:text-text-sub-dark mt-1">Private and personal details.</p>
          </div>
          <div className="px-4 pb-2 space-y-4">
            {[
              ['Date of Birth', '08 Aug 1995'],
              ['Home Address', '1234 Market St, Apt 56'],
              ['Personal Email', 'info@drsumedhatiwari.com'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-3 border-t border-gray-100 dark:border-border-dark">
                <span className="text-sm text-text-sub-light dark:text-text-sub-dark">{label}</span>
                <span className="text-sm font-medium text-text-main-light dark:text-text-main-dark text-right truncate max-w-[60%]">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-xl flex items-center justify-center hover:bg-primary-dark transition-colors z-20">
        <span className="material-symbols-outlined text-2xl">edit</span>
      </button>
    </div>
  );
};

export default Profile;