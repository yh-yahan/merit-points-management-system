import AdminDashboardSidebar from "./AdminDashboardSidebar"
import Statistics from "./Statistics"
import '../css/AdminDashboard.css'
import { Routes, Route } from "react-router-dom"

function AdminDashboard(){
  return(
    <>
      <div style={{ display: "flex" }}>
        <AdminDashboardSidebar />
        <div style={{ flexGrow: 1 }} className="ms-5 content">
          <Routes>
            <Route path="/statistics" element={<Statistics />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

export default AdminDashboard