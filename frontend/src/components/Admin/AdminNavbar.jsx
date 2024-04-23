import { Link, NavLink, useLocation } from 'react-router-dom'
import '../css/navbar.css'

function AdminNavbar({ isLoggedIn }){
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light">
        <div className="container-fluid">
          <Link className="navbar-brand ms-4" to="/">
            <div style={{ maxWidth: "73px" }}>
              <img src="src/assets/LOGO.png" className="img-fluid" alt="Logo" />
            </div>
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              {/* <li className="nav-item" title="General information for admin">
                <NavLink className={`nav-link navLink ${isActive('/dashboard') ? 'active' : ''}`} to="/dashboard">Dashboard</NavLink>
              </li> */}
              <li>
                <NavLink className={`nav-link navLink ${isActive('/leaderboard') ? 'active' : ''}`} to="/leaderboard">Leaderboard</NavLink>
              </li>
            </ul>
            <ul className="navbar-nav ml-auto mb-2 mb-lg-0 me-5">
              <li>
                <NavLink className={`nav-link navLink ${isActive('/notifications') ? 'active' : ''}`} to="/notifications">Notifications</NavLink>
              </li>
              {/* <li>
                <NavLink className={`nav-link navLink ${isActive('/announcements') ? 'active' : ''}`} to="/announcements">Announcements</NavLink>
              </li> */}
              <li>
                <NavLink className={`nav-link navLink ${isActive('/settings') ? 'active' : ''}`} to="/settings">Settings</NavLink>
              </li>
              <li>
                <NavLink className={`nav-link navLink ${isActive('/logout') ? 'active' : ''}`} to="/logout"><i className="bi bi-box-arrow-left"></i> Logout</NavLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}

export default AdminNavbar
