import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

const Admin = lazy(() => import("../Admin/Admin.jsx"));
const Teacher = lazy(() => import("../Teacher/Teacher.jsx"));
const Student = lazy(() => import("../Student/Student.jsx"));

function UserRoutes({ userRole, setIsLoggedIn }) {
  return (
    <Suspense fallback={
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border" style={{ color: 'var(--primary-color)' }}></div>
      </div>
    }>
      <Routes>
        {userRole === "admin" && <Route path="/*" element={<Admin setIsLoggedIn={setIsLoggedIn} />} />}
        {userRole === "teacher" && <Route path="/*" element={<Teacher setIsLoggedIn={setIsLoggedIn} />} />}
        {userRole === "student" && <Route path="/*" element={<Student setIsLoggedIn={setIsLoggedIn} />} />}
      </Routes>
    </Suspense>
  );
}

export default UserRoutes
