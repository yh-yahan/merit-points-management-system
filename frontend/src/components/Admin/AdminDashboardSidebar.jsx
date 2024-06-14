import { Link, useLocation } from 'react-router-dom'
import '../css/AdminDashboard.css'

function AdminDashboardSidebar(){
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  }

  return(
    <>
      <header>
        <button className="ms-4 border border-0 fs-3 d-lg-none" type="button" data-bs-toggle="collapse" data-bs-target="#sidebar">
          <i className="bi bi-list"></i>
        </button>
        <nav className="collapse d-lg-block sidebar collapse bg-white" id="sidebar">
          <div className="position-sticky">
            <div className="list-group list-group-flush mx-3 mt-4">
              <Link to="/statistics" className={`navLink list-group-item list-group-item-action my-2 py-2 ripple ${ isActive('/statistics') && 'isActive' }`} aria-current="true">
                <i className="bi bi-graph-up-arrow"></i> Statistics
              </Link>
              <button className="navLink ms-4 list-group-item sidebar list-group-item-action my-2 py-2 ripple" data-bs-toggle="collapse" data-bs-target="#mu">
                <i className="bi bi-people-fill"></i> Manage users
              </button>
              <Link className={`navLink collapse ms-4 list-group-item list-group-item-action my-2 py-2 ripple ${ isActive('/manage_students') && 'isActive' }`} id="mu" to="/manage_students">Manage students</Link>
              <Link className="navLink collapse ms-4 list-group-item list-group-item-action my-2 py-2 ripple" id="mu" to="/manage_teachers">Manage teachers</Link>

              <button className="navLink ms-3 list-group-item sidebar list-group-item-action my-2 py-2 ripple" data-bs-toggle="collapse" data-bs-target="#mmp">
                Manage merit points
              </button>
              <Link className="navLink collapse ms-4 list-group-item list-group-item-action my-2 py-2 ripple" id="mmp" to="/merit_points_rules">Merit point's rules</Link>
              <Link className="navLink collapse ms-4 list-group-item list-group-item-action my-2 py-2 ripple" id="mmp" to="/edit_merit_points">Edit user's merit points</Link>
              <Link to="/announcements" className="navLink list-group-item list-group-item-action my-2 py-2 ripple" aria-current="true">
                <i className="bi bi-megaphone-fill"></i> Announcements
              </Link>
            </div>
          </div>
        </nav>
      </header>
    </>
  )
}

export default AdminDashboardSidebar
