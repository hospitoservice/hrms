import React from 'react';
import { useNavigate } from 'react-router-dom';
import appData from '../data/appData.json';

const { user, dashboard } = appData;
const { greetingPrefix, shift, menuItems, upcomingSchedule } = dashboard;

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background-light dark:bg-background-dark px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
             <div
              className="w-10 h-10 rounded-full bg-cover bg-center border border-gray-200 dark:border-gray-700 shadow-sm"
              style={{ backgroundImage: `url("${user.avatarSmall}")` }}
            ></div>
          </div>
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
             <span className="material-symbols-outlined text-text-main-light dark:text-text-main-dark">notifications</span>
          </button>
        </div>
        <h1 className="text-[28px] font-bold text-text-main-light dark:text-text-main-dark leading-tight">
          {greetingPrefix}, {user.greetingName}
        </h1>
      </div>

      <main className="flex-1 px-4 mt-2 flex flex-col gap-6">
        {/* Shift Card */}
        <div className="bg-secondary rounded-xl p-5 shadow-lg shadow-secondary/20 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-lg font-bold mb-4">{shift.message}</h2>
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <p className="opacity-90 text-sm font-medium">Shift Duration: {shift.duration}</p>
                <p className="opacity-90 text-sm">Clocked in at {shift.clockInTime}</p>
              </div>
              <button className="bg-white text-secondary px-5 py-2 rounded-lg text-sm font-bold shadow-sm active:scale-95 transition-transform">
                End Shift
              </button>
            </div>
          </div>
          {/* Decorative Circle */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        {/* Grid Menu */}
        <div className="grid grid-cols-2 gap-3">
          {menuItems.map((item) => (
            <button
              key={item.title}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-start p-4 bg-white dark:bg-card-dark rounded-xl border border-gray-100 dark:border-border-dark shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-secondary mb-3 text-3xl">{item.icon}</span>
              <h3 className="font-bold text-text-main-light dark:text-text-main-dark text-base leading-tight text-left">{item.title}</h3>
              <p className="text-text-sub-light dark:text-text-sub-dark text-xs mt-1 text-left">{item.sub}</p>
            </button>
          ))}
        </div>

        {/* Upcoming Schedule */}
        <div>
          <h2 className="text-xl font-bold text-text-main-light dark:text-text-main-dark mb-3">Upcoming Schedule</h2>
          <div className="flex flex-col gap-3">
            {upcomingSchedule.map((event) => (
              <div
                key={event.title}
                className="flex items-center justify-between p-4 bg-white dark:bg-card-dark rounded-xl border border-gray-100 dark:border-border-dark shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined">{event.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-main-light dark:text-text-main-dark">{event.title}</h4>
                    <p className="text-sm text-text-sub-light dark:text-text-sub-dark">{event.detail}</p>
                  </div>
                </div>
                {event.hasDetailsLink && (
                  <button className="text-secondary text-sm font-semibold">Details</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;