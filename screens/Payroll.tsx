import React from 'react';
import { useNavigate } from 'react-router-dom';

const Payroll = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24">
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background-light dark:bg-background-dark">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full text-text-main-light dark:text-text-main-dark">
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <h1 className="text-xl font-bold text-text-main-light dark:text-text-main-dark">Payroll</h1>
        <div className="w-10"></div>
      </div>

      <div className="px-4">
        {/* Profile Header */}
        <div className="flex items-center gap-4 bg-white dark:bg-card-dark p-4 rounded-xl shadow-sm mb-4">
           <div 
             className="w-14 h-14 rounded-full bg-cover bg-center"
             style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBMomu9Jk8qUuBa7xkYJAoQLnUIAWOmjqErLrwkbIL4CyX-_2pw3rx6koOuzIp0pwOd-QYt85koNeW6E2iuXGA9d7YlfDdpQYb78mevDHo0wwFF_UvzKBdUhB03PdLqA5mJ5wHI_bVDJ_1fONX8V5VQKDjYd6bxu0qkQLtd9laMiJgNhf06ByMkjItlhl1cVChlbiauqR5g6ZCsCNe5er5-43vM5rmZ88_l0nNky7a3KNbNDzDnIsJD7k1azaolTHmgDP60z-gG_mo")' }}
           ></div>
           <div>
             <h2 className="font-bold text-text-main-light dark:text-text-main-dark">Dr. Sumedha Tiwari</h2>
             <p className="text-sm text-text-sub-light dark:text-text-sub-dark">Staff ID: DOC56789</p>
             <p className="text-sm text-text-sub-light dark:text-text-sub-dark">Psychiatrist</p>
           </div>
        </div>

        {/* Latest Payslip */}
        <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm p-6 mb-4 text-center border border-gray-100 dark:border-border-dark">
          <div className="flex justify-between text-sm text-text-sub-light dark:text-text-sub-dark mb-4">
            <span>Latest Payslip: October 2025</span>
            <span>Paid: Oct 30</span>
          </div>
          <p className="text-text-sub-light dark:text-text-sub-dark mb-1">Net Pay</p>
          <h2 className="text-4xl font-bold text-green-600 dark:text-green-500 tracking-tight mb-4">$8,750.00</h2>
          <button className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium text-sm transition-colors w-full sm:w-auto">
            View / Download Payslip
          </button>
        </div>

        {/* Accordion */}
        <details className="group bg-white dark:bg-card-dark rounded-xl border border-gray-200 dark:border-border-dark mb-6 overflow-hidden">
          <summary className="flex items-center justify-between p-4 cursor-pointer list-none select-none">
            <span className="font-medium text-text-main-light dark:text-text-main-dark">View Compensation Package</span>
            <span className="material-symbols-outlined text-text-sub-light dark:text-text-sub-dark transition-transform group-open:rotate-180">expand_more</span>
          </summary>
          <div className="px-4 pb-4 border-t border-gray-100 dark:border-border-dark pt-3 text-sm space-y-2">
            {[
              ['Base Salary', '$8,000.00'],
              ['On-Call Allowance', '$1,200.00'],
              ['Hazard Pay', '$500.00'],
              ['Malpractice Insurance', '-$450.00'],
              ['Health Plan', '-$350.00'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-text-sub-light dark:text-text-sub-dark">
                <span>{k}:</span>
                <span className="font-medium text-text-main-light dark:text-text-main-dark">{v}</span>
              </div>
            ))}
            <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-border-dark font-bold text-text-main-light dark:text-text-main-dark mt-2">
              <span>Annual Salary:</span>
              <span>$106,800.00</span>
            </div>
          </div>
        </details>

        <h3 className="text-lg font-bold text-text-main-light dark:text-text-main-dark mb-3">Payslip History</h3>
        
        {/* Search */}
        <div className="relative mb-4">
          <input 
            type="text" 
            placeholder="Search by month or year..."
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-border-dark bg-white dark:bg-card-dark text-text-main-light dark:text-text-main-dark focus:ring-2 focus:ring-primary/50 outline-none"
          />
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-sub-light dark:text-text-sub-dark">search</span>
        </div>

        {/* History List */}
        <div className="flex flex-col rounded-xl border border-gray-200 dark:border-border-dark bg-white dark:bg-card-dark overflow-hidden divide-y divide-gray-100 dark:divide-border-dark">
          {[
            { month: 'October 2023', paid: 'Oct 31, 2023', amount: '$8,680.00' },
            { month: 'September 2023', paid: 'Sep 30, 2023', amount: '$8,810.00' },
            { month: 'August 2023', paid: 'Aug 31, 2023', amount: '$8,750.00' },
          ].map((item) => (
            <div key={item.month} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
              <div>
                <p className="font-medium text-text-main-light dark:text-text-main-dark">{item.month}</p>
                <p className="text-xs text-text-sub-light dark:text-text-sub-dark mt-0.5">Paid on: {item.paid}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-text-main-light dark:text-text-main-dark">{item.amount}</span>
                <span className="material-symbols-outlined text-text-sub-light dark:text-text-sub-dark text-lg">chevron_right</span>
              </div>
            </div>
          ))}
        </div>
        
        <p className="text-center text-xs text-text-sub-light dark:text-text-sub-dark mt-8 px-4 opacity-70">
          This screen contains confidential information. Please ensure it is handled securely.
        </p>
      </div>
    </div>
  );
};

export default Payroll;