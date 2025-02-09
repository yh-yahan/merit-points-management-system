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
  const [loading, setLoading] = useState(true);
  const [primaryColor, setPrimaryColor] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAuth(){
      try {
        const response = await api.post('/check-auth', { withCredentials: true });
        setIsLoggedIn(true);
        setUserRole(response.data.userType);
        setUser(response.data);
      }
      catch(err){
        // console.log(err);
      }
      finally{
        setLoading(false);
      }
    };
    checkAuth();
    navigate('/');
  }, []);

  useEffect(() => {
    async function getPrimaryColor(){
      try {
        const response = await api.get('/primary-color');
        const primaryColor = response.data.primary_color;
        setPrimaryColor(primaryColor);
        document.documentElement.style.setProperty('--primary-color', primaryColor);
      }
      catch(err){
        console.log(err);
      }
    }

    getPrimaryColor();
  }, []);

  if(loading){
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-danger mb-3" role="status" style={{ width: '6rem', height: '6rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="text-danger">Loading...</span>
      </div>
    );
  }

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
          <Route path="/*" element={<UserRoutes userRole={userRole} setIsLoggedIn={setIsLoggedIn} />} />
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
