import { Routes, Route } from "react-router-dom";
import Admin from "../Admin/Admin";
import Teacher from "../Teacher/Teacher";
import Student from "../Student/Student";

function UserRoutes({ userRole }){
  return (
    <Routes>
      {userRole === "admin" && <Route path="/*" element={<Admin />} />}
      {userRole === "teacher" && <Route path="/*" element={<Teacher />} />}
      {userRole === "student" && <Route path="/*" element={<Student />} />}
    </Routes>
  );
}

export default UserRoutes