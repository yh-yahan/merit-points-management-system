import { Routes, Route } from "react-router-dom";
import Admin from "../Admin/Admin.jsx";
import Teacher from "../Teacher/Teacher.jsx";
import Student from "../Student/Student.jsx";

function UserRoutes({ userRole, setIsLoggedIn }){
  return (
    <Routes>
      {userRole === "admin" && <Route path="/*" element={<Admin setIsLoggedIn={setIsLoggedIn} />} />}
      {userRole === "teacher" && <Route path="/*" element={<Teacher setIsLoggedIn={setIsLoggedIn} />} />}
      {userRole === "student" && <Route path="/*" element={<Student setIsLoggedIn={setIsLoggedIn} />} />}
    </Routes>
  );
}

export default UserRoutes
