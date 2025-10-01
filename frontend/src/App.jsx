import { Routes, Route, useNavigate } from "react-router-dom"
import api from './api.js'
import { useState, useEffect } from 'react'
import { lazy, Suspense } from 'react'

// Utilities
const Navbar = lazy(() => import("./components/Utility/Navbar.jsx"));
const Login = lazy(() => import("./components/Utility/Authentication/Login.jsx"));
const InvitationCode = lazy(() => import("./components/Utility/Authentication/InvitationCode.jsx"));
const NotFound = lazy(() => import("./components/Utility/NotFound.jsx"));
const UserRoutes = lazy(() => import("./components/Utility/UserRoutes.jsx"));

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
        setUserRole(response.data.role);
        setUser(response.data);
        setError("");
        if (!response.data?.role && location.pathname !== '/') {
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
        <Suspense fallback={
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <div className="spinner-border" style={{ color: primaryColor }}></div>
          </div>
        }>
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
                    setUser={setUser} 
                    isLoggedIn={isLoggedIn} />}
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
        </Suspense>
      )}
    </>
  )
}

export default App
