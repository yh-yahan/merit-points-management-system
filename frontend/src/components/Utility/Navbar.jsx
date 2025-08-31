import AdminNavbar from "../Admin/AdminNavbar.jsx"
import TeachersNavbar from "../Teacher/TeachersNavbar.jsx"
import StudentsNavbar from "../Student/StudentsNavbar.jsx"

function Navbar({ isLoggedIn, userRole, setUser, setUserRole, setIsLoggedIn }) {
  return (
    <>
      {
        isLoggedIn && userRole == "admin" && <AdminNavbar
          setIsLoggedIn={setIsLoggedIn}
          setUser={setUser}
          setUserRole={setUserRole}
        /> ||
        isLoggedIn && userRole == "teacher" && <TeachersNavbar
          setIsLoggedIn={setIsLoggedIn}
          etUser={setUser}
          setUserRole={setUserRole} /> ||
        isLoggedIn && userRole == "student" && <StudentsNavbar
          setIsLoggedIn={setIsLoggedIn}
          etUser={setUser}
          setUserRole={setUserRole} />
      }
    </>
  );
}

export default Navbar