import AdminDashboard from './AdminDashboard.jsx';
import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from 'react';

const AdminSettings = lazy(() => import("./AdminSettings.jsx"));
const Leaderboard = lazy(() => import("../Utility/Leaderboard.jsx"));
const AdminNotifications = lazy(() => import("./AdminNotifications.jsx"));
const AdminInvitationCode = lazy(() => import("./AdminInvitationCode.jsx"));
const AdminCreateInvitationCode = lazy(() => import("./AdminCreateInvitationCode.jsx"));

function Admin({ setIsLoggedIn }) {
  return (
    <>
      <Suspense fallback={
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
          <div className="spinner-border" style={{ color: 'var(--primary-color)' }}></div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/manage/students" element={<AdminDashboard />} />
          <Route path="/manage/teachers" element={<AdminDashboard />} />
          <Route path="/transaction-history" element={<AdminDashboard />} />
          <Route path="/merit_points_rules" element={<AdminDashboard />} />
          <Route path="/edit_merit_points" element={<AdminDashboard />} />
          <Route path="/add_rule" element={<AdminDashboard />} />
          <Route path="/academic-structure" element={<AdminDashboard />} />
          <Route path="/settings" element={<AdminSettings setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/notifications" element={<AdminNotifications />} />
          <Route path="/invitation-code" element={<AdminInvitationCode />} />
          <Route path="/invitation-code/create" element={<AdminCreateInvitationCode />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default Admin