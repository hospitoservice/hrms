import React from 'react';
import { useNavigate } from 'react-router-dom';

const Appointments = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-border-dark">
        <button onClick={() => navigate('/')} className="w-10 h-10 flex items-center justify-center text-text-main-light dark:text-text-main-dark">
          <span className="material-symbols-outlined text-2xl">calendar_month</span>
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold text-text-main-light dark:text-text-main-dark">Today's Appointments</h1>
          <p className="text-sm text-text-sub-light dark:text-text-sub-dark">October 26, 2023</p>
        </div>
        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
           <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6GPh2YTjhU6lhHOHdhaLAycanSeUD2zWzhMSHaY9Ee8Bd-kx_nko34xOoC487OLselz49RYEEtNb1WbkyeZCXWLaHPphJtPP8644aUuvUulU6UO7i1NDVd88VlrXNxhGGqCjM8AQWSDIpUtFySK7C9HQjy91Vz0P3pYw6L1RYnQR4e39NJA3ephIIGkyxggv05IQcgaAVqjmV5nBSBp6Bkh50jevGxI1KxyBZcXEjg_WmXmcovZfhc7sA5ecZ81tTro6Pto1r3bw" alt="Dr Profile" className="w-full h-full object-cover" />
        </div>
      </div>

      <main className="flex-1 p-4 space-y-4">
        {/* Appointment 1 */}
        <details className="group bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-border-dark shadow-sm overflow-hidden">
          <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <div>
                <p className="font-bold text-text-main-light dark:text-text-main-dark">10:30 AM</p>
                <p className="text-sm text-text-sub-light dark:text-text-sub-dark">Adrianne Smith</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-gray-400 group-open:rotate-180 transition-transform">expand_more</span>
          </summary>
          <div className="border-t border-gray-100 dark:border-gray-800 p-4 pt-2">
             <div className="grid grid-cols-2 gap-4 mb-4 mt-2">
               <div>
                 <p className="text-xs font-bold uppercase text-text-sub-light dark:text-text-sub-dark tracking-wide">Patient</p>
                 <p className="font-medium text-text-main-light dark:text-text-main-dark">Adrianne Smith</p>
               </div>
               <div>
                 <p className="text-xs font-bold uppercase text-text-sub-light dark:text-text-sub-dark tracking-wide">Contact</p>
                 <p className="font-medium text-text-main-light dark:text-text-main-dark">555-0101</p>
               </div>
               <div className="col-span-2">
                 <p className="text-xs font-bold uppercase text-text-sub-light dark:text-text-sub-dark tracking-wide">Details</p>
                 <p className="font-medium text-text-main-light dark:text-text-main-dark">Female, 34 yrs</p>
               </div>
             </div>
             <div className="mb-4">
               <p className="text-xs font-bold uppercase text-text-sub-light dark:text-text-sub-dark tracking-wide mb-1">Symptoms</p>
               <p className="text-sm text-text-main-light dark:text-text-main-dark leading-relaxed">Annual check-up and discussion about persistent headaches over the last two weeks.</p>
             </div>
             <div className="flex gap-3">
               <button className="flex-1 h-10 rounded-lg bg-primary/10 text-primary font-bold text-sm">View Full Chart</button>
               <button className="flex-1 h-10 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-colors">Start Consultation</button>
             </div>
          </div>
        </details>

        {/* Appointment 2 */}
        <details className="group bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-border-dark shadow-sm overflow-hidden" open>
          <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              <div>
                <p className="font-bold text-text-main-light dark:text-text-main-dark">11:00 AM</p>
                <p className="text-sm text-text-sub-light dark:text-text-sub-dark">Alex Johnson</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-gray-400 group-open:rotate-180 transition-transform">expand_more</span>
          </summary>
           <div className="border-t border-gray-100 dark:border-gray-800 p-4 pt-2">
             <div className="grid grid-cols-2 gap-4 mb-4 mt-2">
               <div>
                 <p className="text-xs font-bold uppercase text-text-sub-light dark:text-text-sub-dark tracking-wide">Patient</p>
                 <p className="font-medium text-text-main-light dark:text-text-main-dark">Alex Johnson</p>
               </div>
               <div>
                 <p className="text-xs font-bold uppercase text-text-sub-light dark:text-text-sub-dark tracking-wide">Contact</p>
                 <p className="font-medium text-text-main-light dark:text-text-main-dark">555-0102</p>
               </div>
               <div className="col-span-2">
                 <p className="text-xs font-bold uppercase text-text-sub-light dark:text-text-sub-dark tracking-wide">Details</p>
                 <p className="font-medium text-text-main-light dark:text-text-main-dark">Male, 42 yrs</p>
               </div>
             </div>
             <div className="mb-4">
               <p className="text-xs font-bold uppercase text-text-sub-light dark:text-text-sub-dark tracking-wide mb-1">Symptoms</p>
               <p className="text-sm text-text-main-light dark:text-text-main-dark leading-relaxed">Follow-up regarding blood pressure medication. Experiencing persistent cough and mild fever.</p>
             </div>
             <div className="flex gap-3">
               <button className="flex-1 h-10 rounded-lg bg-primary/10 text-primary font-bold text-sm">View Full Chart</button>
               <button className="flex-1 h-10 rounded-lg bg-primary text-white font-bold text-sm hover:bg-primary-dark transition-colors">Start Consultation</button>
             </div>
          </div>
        </details>

        {/* Appointment 3 */}
        <details className="group bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-border-dark shadow-sm overflow-hidden">
          <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <div>
                <p className="font-bold text-text-main-light dark:text-text-main-dark">11:30 AM</p>
                <p className="text-sm text-text-sub-light dark:text-text-sub-dark">Maria Garcia</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-gray-400 group-open:rotate-180 transition-transform">expand_more</span>
          </summary>
          <div className="border-t border-gray-100 dark:border-gray-800 p-4 pt-2">
             <div className="grid grid-cols-2 gap-4 mb-4 mt-2">
               <div>
                 <p className="text-xs font-bold uppercase text-text-sub-light dark:text-text-sub-dark tracking-wide">Patient</p>
                 <p className="font-medium text-text-main-light dark:text-text-main-dark">Maria Garcia</p>
               </div>
               <div>
                 <p className="text-xs font-bold uppercase text-text-sub-light dark:text-text-sub-dark tracking-wide">Contact</p>
                 <p className="font-medium text-text-main-light dark:text-text-main-dark">555-0103</p>
               </div>
             </div>
          </div>
        </details>
      </main>
    </div>
  );
};

export default Appointments;