import Navbar from "./components/Utility/Navbar.jsx"
import AdminDashboard from "./components/Admin/AdminDashboard.jsx"
import Login from "./components/Utility/Authentication/Login.jsx"
// import Signup from "./components/Utility/Authentication/Signup.jsx"
import InvitationCode from "./components/Utility/Authentication/InvitationCode.jsx"
import Footer from "./components/Utility/Footer.jsx"
import NotFound from "./components/Utility/NotFound.jsx"
import { Routes, Route } from "react-router-dom"
import { useState } from 'react'

function App() {
  const [userRole, setUserRoles] = useState("admin");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} userRole={userRole} />
      <Routes>
        {/* { !isLoggedIn && <Route path="/" element={<Login setIsLoggedIn={setIsLoggedIn} setUserRoles={setUserRoles} />} /> } */}
        {/* { !isLoggedIn && <Route path="/signup" element={<InvitationCode isLoggedIn={isLoggedIn} />} /> } */}
        {/* { isLoggedIn && userRole === "admin" && <Route path="/" element={<AdminDashboard />} /> } */}
        {/* { isLoggedIn && userRole === "admin" && <Route path="/dashboard" element={<AdminDashboard />} /> } */}
        {/* Conditionally render routes based on authentication and user type */}
        { isLoggedIn ? (
          <Route
            path="/"
            element={
              userRole === "admin" ? (
                <Admin />
              ) : userRole === "teacher" ? (
                <Teacher />
              ) : (
                <Student />
              )
            }
          />
        ) : (
          <>
            <Route 
              path="/" 
              element={<Login setIsLoggedIn={setIsLoggedIn} />}
              setUserRoles={setUserRoles} 
            />
            <Route path="/signup" element={<InvitationCode isLoggedIn={isLoggedIn} />} />
          </>
        ) }
        <Route path="*" element={<NotFound />} />
      </Routes>
      { isLoggedIn && <Footer /> }
    </>
  )
}

export default App
