import AdminDashboard from './AdminDashboard.jsx'
import { Link } from 'react-router-dom'
import { Routes, Route } from "react-router-dom"
import AdminSettings from './AdminSettings.jsx';
import Leaderboard from '../Utility/Leaderboard.jsx';
import AdminNotifications from './AdminNotifications.jsx';

function Admin({ setIsLoggedIn }){
  return (
    <>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/manage/students" element={<AdminDashboard />} />
        <Route path="/manage/teachers" element={<AdminDashboard />} />
        <Route path="/transaction-history" element={<AdminDashboard />} />
        <Route path="/merit_points_rules" element={<AdminDashboard />} />
        <Route path="/edit_merit_points" element={<AdminDashboard />} />
        <Route path="/add_rule" element={<AdminDashboard />} />
        <Route path="/settings" element={<AdminSettings setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/notifications" element={<AdminNotifications />} />
      </Routes>
    </>
  );
}

export default Admin