import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './screens/Dashboard';
import Profile from './screens/Profile';
import Attendance from './screens/Attendance';
import ApplyLeave from './screens/ApplyLeave';
import Payroll from './screens/Payroll';
import Benefits from './screens/Benefits';
import Appointments from './screens/Appointments';
import BottomNav from './components/BottomNav';

const App = () => {
  return (
    <Router>
      <div className="antialiased text-text-main-light dark:text-text-main-dark">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/apply-leave" element={<ApplyLeave />} />
          <Route path="/payroll" element={<Payroll />} />
          <Route path="/benefits" element={<Benefits />} />
          <Route path="/appointments" element={<Appointments />} />
        </Routes>
        <BottomNav />
      </div>
    </Router>
  );
};

export default App;