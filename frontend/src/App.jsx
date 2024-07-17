import Navbar from "./components/Utility/Navbar.jsx"
import Login from "./components/Utility/Authentication/Login.jsx"
// import Signup from "./components/Utility/Authentication/Signup.jsx"
import InvitationCode from "./components/Utility/Authentication/InvitationCode.jsx"
import Admin from "./components/Admin/Admin.jsx"
import Teacher from "./components/Teacher/Teacher.jsx"
import Student from "./components/Student/Student.jsx"
import Footer from "./components/Utility/Footer.jsx"
import NotFound from "./components/Utility/NotFound.jsx"
import UserRoutes from "./components/Utility/UserRoutes.jsx"
import { Routes, Route, useNavigate } from "react-router-dom"
import api from './api.js'
import { useState, useEffect } from 'react'

function App() {
  const [userRole, setUserRole] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // useEffect(() => {
  //   async function checkAuth(){
  //     try {
  //       const response = await api.post('/check_auth', { withCredentials: true });
  //       setIsLoggedIn(true);
  //       setUserRole(response.data.userType);
  //       setUser(response.data);
  //     }
  //     catch(err){
  //       console.log(err);
  //     }
  //   };
  //   checkAuth();
  //   navigate('/');
  // }, []);

  return (
    <>
      <Navbar 
      isLoggedIn={isLoggedIn} 
      userRole={userRole} 
      setIsLoggedIn={setIsLoggedIn} 
      />
      <Routes>
        { isLoggedIn ? (
          // <Route
          //   path="/*"
          //   element={
          //     userRole === "admin" ? (
          //       <Admin />
          //     ) : userRole === "teacher" ? (
          //       <Teacher />
          //     ) : (
          //       <Student />
          //     )
          //   }
          // />
          <Route path="/*" element={<UserRoutes userRole={userRole} />} />
        ) : (
          <>
            <Route 
              path="/" 
              element={<Login setIsLoggedIn={setIsLoggedIn} 
              setUserRole={setUserRole}
              userRole={userRole} 
              setUser={setUser} />}
            />
            <Route 
            path="/signup" 
            element={<InvitationCode isLoggedIn={isLoggedIn} 
            setUserRole={setUserRole}
            setUser={setUser} 
            userRole={userRole} 
            setIsLoggedIn={setIsLoggedIn}
            />} 
            />
          </>
        ) }
        <Route path="*" element={<NotFound />} />
      </Routes>
      { isLoggedIn && <Footer /> }
    </>
  )
}

export default App
