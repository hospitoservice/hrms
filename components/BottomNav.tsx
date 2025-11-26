import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { name: 'Home', icon: 'dashboard', path: '/' },
    { name: 'Appointments', icon: 'calendar_month', path: '/appointments' },
    { name: 'Payroll', icon: 'payments', path: '/payroll' },
    { name: 'Profile', icon: 'person', path: '/profile' },
  ];

  // Don't show bottom nav on deep detail screens if desired, keeping it simple for now
  // Hiding on Apply Leave to give more screen real estate
  if (location.pathname === '/apply-leave') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/90 dark:bg-card-dark/95 backdrop-blur-md border-t border-gray-200 dark:border-border-dark z-50">
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => navigate(item.path)}
            className={`inline-flex flex-col items-center justify-center px-5 group ${
              isActive(item.path)
                ? 'text-primary'
                : 'text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary'
            }`}
            type="button"
          >
            <span
              className={`material-symbols-outlined text-2xl mb-1 transition-all duration-200 ${isActive(item.path) ? 'material-symbols-filled' : ''}`}
            >
              {item.icon}
            </span>
            <span className="text-xs font-semibold">{item.name}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;