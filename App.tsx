import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AuthService from './service/AuthService.js';
import Dashboard    from './screens/Dashboard';
import Profile      from './screens/Profile';
import Attendance   from './screens/Attendance';
import ApplyLeave   from './screens/ApplyLeave';
import LeaveHistory from './screens/LeaveHistory';
import RegisterComplaint from './screens/RegisterComplaint';
import Payroll      from './screens/Payroll';
import Benefits     from './screens/Benefits';
import Appointments      from './screens/Appointments';
import AppointmentDetail from './screens/AppointmentDetail';
import Schedule          from './screens/Schedule';
import Login             from './screens/Login';
import BottomNav         from './components/BottomNav';

// Redirects unauthenticated users to /login, preserving the intended destination.
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  if (!AuthService.isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

// Redirects already-authenticated users away from /login.
const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (AuthService.isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

// Hides the BottomNav on the login screen
const AppShell: React.FC = () => {
  const location = useLocation();
  const hideNav  = location.pathname === '/login'
    || location.pathname === '/leave-history'
    || location.pathname === '/register-complaint'
    || location.pathname.startsWith('/appointments/')
    || location.pathname.startsWith('/schedule/');

  return (
    <div className="antialiased text-text-main-light dark:text-text-main-dark">
      <Routes>
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />

        <Route path="/"            element={<PrivateRoute><Dashboard />   </PrivateRoute>} />
        <Route path="/profile"     element={<PrivateRoute><Profile />     </PrivateRoute>} />
        <Route path="/attendance"  element={<PrivateRoute><Attendance />  </PrivateRoute>} />
        <Route path="/apply-leave" element={<PrivateRoute><ApplyLeave />  </PrivateRoute>} />
        <Route path="/leave-history" element={<PrivateRoute><LeaveHistory /></PrivateRoute>} />
        <Route path="/register-complaint" element={<PrivateRoute><RegisterComplaint /></PrivateRoute>} />
        <Route path="/payroll"     element={<PrivateRoute><Payroll />     </PrivateRoute>} />
        <Route path="/benefits"    element={<PrivateRoute><Benefits />    </PrivateRoute>} />
        <Route path="/appointments"     element={<PrivateRoute><Appointments />    </PrivateRoute>} />
        <Route path="/appointments/:id" element={<PrivateRoute><AppointmentDetail /></PrivateRoute>} />
        <Route path="/schedule"         element={<PrivateRoute><Schedule />        </PrivateRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!hideNav && <BottomNav />}
    </div>
  );
};

const App: React.FC = () => (
  <Router>
    <AppShell />
  </Router>
);

export default App;
