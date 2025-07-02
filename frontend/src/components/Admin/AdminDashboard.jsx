import AdminDashboardSidebar from "./AdminDashboardSidebar.jsx"
import AdminOverview from "./AdminOverview.jsx"
import AdminManageStudents from "./AdminManageStudents.jsx"
import '../css/AdminDashboard.css'
import { Routes, Route } from "react-router-dom"
import { useLocation } from 'react-router-dom'
import AdminManageTeachers from "./AdminManageTeachers.jsx"
import AdminTransactionHistory from "./AdminTransactionHistory.jsx"
import AdminMeritPointRules from "./AdminMeritPointRules.jsx"
import AdminEditMeritPoints from "./AdminEditMeritPoints.jsx"
import AdminAcademicStructure from "./AdminAcademicStructure.jsx"

function AdminDashboard(){
  const location = useLocation().pathname;

  return(
    <>
      <div style={{ display: "flex" }}>
        <AdminDashboardSidebar />
        { location == '/' && <AdminOverview /> }
        { location == '/manage/students' && <AdminManageStudents /> }
        { location == '/manage/teachers' && <AdminManageTeachers /> }
        { location == '/transaction-history' && <AdminTransactionHistory /> }
        { location == '/merit_points_rules' && <AdminMeritPointRules /> }
        { location == '/edit_merit_points' && <AdminEditMeritPoints />}
        { location == '/academic-structure' && <AdminAcademicStructure />}
      </div>
    </>
  );
}

export default AdminDashboard
