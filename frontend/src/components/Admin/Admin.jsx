import AdminDashboard from './AdminDashboard.jsx'
import { Link } from 'react-router-dom'
import { Routes, Route } from "react-router-dom"

function Admin(){
  return (
    <>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/manage/students" element={<AdminDashboard />} />
        <Route path="/manage/teachers" element={<AdminDashboard />} />
        <Route path="/transaction_history" element={<AdminDashboard />} />
        <Route path="/merit_points_rules" element={<AdminDashboard />} />
        <Route path="/edit_merit_points" element={<AdminDashboard />} />
        <Route path="/add_rule" element={<AdminDashboard />} />
      </Routes>
    </>
  );
}

export default Admin