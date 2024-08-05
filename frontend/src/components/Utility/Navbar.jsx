import AdminNavbar from "../Admin/AdminNavbar.jsx"
import TeachersNavbar from "../Teacher/TeachersNavbar.jsx"
import StudentsNavbar from "../Student/StudentsNavbar.jsx"

function Navbar({ isLoggedIn, userRole, setIsLoggedIn }){
  return(
    <>
      { 
        isLoggedIn && userRole=="admin" && <AdminNavbar 
        setIsLoggedIn={setIsLoggedIn} 
        /> || 
        isLoggedIn && userRole=="teacher" && <TeachersNavbar /> ||
        isLoggedIn && userRole=="student" && <StudentsNavbar setIsLoggedIn={setIsLoggedIn} />
      }
    </>
  );
}

export default Navbar