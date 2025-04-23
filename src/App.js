import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { ThemeProviderWrapper } from './Layout/ThemeContext';
import Dashboard from './pages/Dashboard';
import AppLayout from './pages/AppLayout';
import JobCards from './pages/JobCards';
import RecordReport from './pages/Reports';
import AssignEngineer from './pages/AssignEngineer';
import WorkInProgress from './pages/WorkInProgress';
import QualityCheck from './pages/QualityCheck';
import SetServiceReminder from './pages/SetServiceReminder';
import InsuranceManagement from './pages/InsuranceManagement';
import InventoryManagement from './pages/InventoryManagement';
import GarageLogin from './Login/LoginPage';
import SignUpPage from './Login/SignUpPage';
import ProtectedRoute from './Login/ProtectedRoute';

function App() {
  return (
    <ThemeProviderWrapper>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Auth routes - accessible without login */}
          <Route path="/login" element={<GarageLogin />} />
          <Route path="/signup" element={<SignUpPage />} />
          
          {/* Protected routes - require authentication */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="jobs" element={<JobCards />} />
              <Route path="inventory" element={<InventoryManagement />} />
              <Route path="reports" element={<RecordReport />} />
              <Route path="assign-engineer" element={<AssignEngineer />} />
              <Route path="work-in-progress" element={<WorkInProgress />} />
              <Route path="quality-check" element={<QualityCheck />} />
              <Route path="reminders" element={<SetServiceReminder />} />
              <Route path="insurance" element={<InsuranceManagement />} />
            </Route>
          </Route>
          
          {/* Redirect any unknown routes to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ThemeProviderWrapper>
  );
}

export default App;
// src/App.js
// import React from 'react';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// // import GarageLogin from './components/GarageLogin';
// // import GarageDashboard from './components/GarageDashboard';
// import GarageLogin from './Login/LoginPage';
// import Dashboard from '../../master-admin/src/pages/Dashboard';

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/login" element={<GarageLogin />} />
//         <Route path="/dashboard" element={<Dashboard />} />
//         {/* Other routes */}
//       </Routes>
//     </Router>
//   );
// }

// export default App;