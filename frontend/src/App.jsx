import AdminNavbar from "./components/Admin/AdminNavbar.jsx"
import TeachersNavbar from "./components/Teacher/TeachersNavbar.jsx"
import StudentsNavbar from "./components/Student/StudentsNavbar.jsx"
import Login from "./components/Utility/Authentication/Login.jsx"
import Signup from "./components/Utility/Authentication/Signup.jsx"
import { Routes, Route } from "react-router-dom"
import { useState } from 'react'

function App() {
  const [userRole, setUserRoles] = useState("admin");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <>
      { isLoggedIn && userRole === "admin" && <AdminNavbar  /> }
      { isLoggedIn && userRole === "teacher" && <TeachersNavbar /> }
      { isLoggedIn && userRole === "student" && <StudentsNavbar /> }
      <Routes>
        { !isLoggedIn && <Route path="/" element={<Login />} /> }
        { !isLoggedIn && <Route path="/signup" element={<Signup isLoggedIn={isLoggedIn} />} /> }
      </Routes>
    </>
  )
}

export default App
