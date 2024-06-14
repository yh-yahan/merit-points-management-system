import AdminNavbar from "../Admin/AdminNavbar.jsx"
import TeachersNavbar from "../Teacher/TeachersNavbar.jsx"
import StudentsNavbar from "../Student/StudentsNavbar.jsx"

function Navbar({ isLoggedIn, userRole}){
  return(
    <>
      { 
        isLoggedIn && userRole=="admin" && <AdminNavbar /> || 
        isLoggedIn && userRole=="teacher" && <TeachersNavbar /> ||
        isLoggedIn && userRole=="student" && <StudentsNavbar />
      }
    </>
  );
}

export default Navbar