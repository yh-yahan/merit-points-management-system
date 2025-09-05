import Navbar from "./components/Utility/Navbar.jsx"
import Login from "./components/Utility/Authentication/Login.jsx"
// import Signup from "./components/Utility/Authentication/Signup.jsx"
import InvitationCode from "./components/Utility/Authentication/InvitationCode.jsx"
import Admin from "./components/Admin/Admin.jsx"
import Teacher from "./components/Teacher/Teacher.jsx"
import Student from "./components/Student/Student.jsx"
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
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await api.post('/check-auth', { withCredentials: true });
        setIsLoggedIn(true);
        setUserRole(response.data.userType);
        setUser(response.data);
        setError("");
        if (!response.data?.userType && location.pathname !== '/') {
          navigate('/');
        }
      } catch (err) {
        if (err.response.status) {
          navigate('/');
        } else {
          setError("An error occured.");
        }
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
    // navigate('/');
  }, []);

  useEffect(() => {
    async function getPrimaryColor() {
      try {
        const response = await api.get('/primary-color');
        const primaryColor = response.data.primary_color;
        setPrimaryColor(primaryColor);
        document.documentElement.style.setProperty('--primary-color', primaryColor);
      } catch (err) {
        setPrimaryColor('#0d6efd');
        document.documentElement.style.setProperty('--primary-color', '#0d6efd');
      }
    }

    getPrimaryColor();
  }, []);

  if (loading) {
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center"
        style={{ minHeight: '100vh' }}>
        <div
          className="spinner-border mb-3" role="status"
          style={{ width: '6rem', height: '6rem', color: primaryColor }}>
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="" style={{ color: primaryColor }}>Loading...</span>
      </div>
    );
  }

  return (
    <>
      {error && (<div className="alert alert-danger m-5">{error}</div>)}
      {!error && (
        <>
          <Navbar
            isLoggedIn={isLoggedIn}
            userRole={userRole}
            setIsLoggedIn={setIsLoggedIn}
            setUser={setUser}
            setUserRole={setUserRole}
          />
          <Routes>
            {isLoggedIn ? (
              <Route path="/*" element={<UserRoutes
                userRole={userRole}
                setIsLoggedIn={setIsLoggedIn} />}
              />
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
            )}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </>
      )
      }
    </>
  )
}

export default App
