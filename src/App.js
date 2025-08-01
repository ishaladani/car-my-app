import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CssBaseline } from "@mui/material";
import { ThemeProviderWrapper } from "./Layout/ThemeContext";
import Dashboard from "./pages/Dashboard";
import AppLayout from "./pages/AppLayout";
import JobCards from "./pages/JobCards";
import RecordReport from "./pages/Reports";
import AssignEngineer from "./pages/AssignEngineer";
import WorkInProgress from "./pages/WorkInProgress";
import QualityCheck from "./pages/QualityCheck";
import SetServiceReminder from "./pages/SetServiceReminder";
import InsuranceManagement from "./pages/InsuranceManagement";
import InventoryManagement from "./pages/InventoryManagement";
import LoginPage from "./Login/LoginPage";
import EnhancedSignUpPage from "./Login/SignUpPage";

import BillingPage from "./pages/BillingPage";
import UserManagement from "./pages/UserList";
import AwaitingApproval from "./pages/AwaitingApproval";
import WaitingApprovalPage from "./pages/WaitingApprovalPage";
import Profile from "./pages/Profile";
import AddEngineer from "./pages/AddEngineer";
import RenewPlanPage from "./Login/RenewPlanPage";
import RenewPlanFlow from "./components/RenewPlanFlow";
import InventoryDashboard from "./pages/InventoryDashboard";
import History from "./pages/History";

function App() {
  return (
    <ThemeProviderWrapper>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<EnhancedSignUpPage />} />
          <Route path="/signup/:id" element={<EnhancedSignUpPage />} />
          <Route path="/renew-plan" element={<RenewPlanPage />} />
          <Route path="/renew-plan-flow" element={<RenewPlanFlow />} />
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="jobs" element={<JobCards />} />
            <Route path="jobs/:id" element={<JobCards />} />
            <Route path="inventory" element={<InventoryManagement />} />
            <Route path="reports" element={<RecordReport />} />
            <Route path="assign-engineer/:id" element={<AssignEngineer />} />
            <Route path="work-in-progress/:id" element={<WorkInProgress />} />
            <Route path="quality-check/:id" element={<QualityCheck />} />
            <Route path="reminders" element={<SetServiceReminder />} />
            <Route path="insurance" element={<InsuranceManagement />} />
            <Route path="billing/:id" element={<BillingPage />} />
            <Route path="UserManagemt" element={<UserManagement />} />
            <Route path="Profile" element={<Profile />} />
            <Route path="add-Engineer" element={<AddEngineer />} />
            <Route
              path="inventory-dashboard"
              element={<InventoryDashboard />}
            />
            <Route path="history" element={<History />} />
          </Route>

          <Route path="AwaitingApproval" element={<AwaitingApproval />} />
          <Route path="/waiting-approval" element={<WaitingApprovalPage />} />
        </Routes>
      </Router>
    </ThemeProviderWrapper>
  );
}

export default App;

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
