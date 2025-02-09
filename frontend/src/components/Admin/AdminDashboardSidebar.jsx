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
              <Link to="/" className={`navLink list-group-item list-group-item-action my-2 py-2 ripple ${ isActive('/') && 'isActive' }`} aria-current="true">
                <i class="bi bi-graph-up"></i> Overview
              </Link>
              <Link to="/transaction-history" className={`navLink list-group-item list-group-item-action my-2 py-2 ripple ${ isActive('/transaction-history') && 'isActive' }`} aria-current="true">
                <i class="bi bi-clock-history"></i> Merit point transaction history
              </Link>
              {/* <Link to="/statistics" className={`navLink list-group-item list-group-item-action my-2 py-2 ripple ${ isActive('/statistics') && 'isActive' }`} aria-current="true">
                <i className="bi bi-graph-up-arrow"></i> Statistics
              </Link> */}
              <button className="navLink ms-4 link-style list-group-item sidebar list-group-item-action my-2 py-2 ripple" data-bs-toggle="collapse" data-bs-target="#mu">
                <i className="bi bi-people-fill"></i> Manage users
              </button>
              <Link className={`navLink collapse ms-4 list-group-item list-group-item-action my-2 py-2 ripple ${ isActive('/manage/students') && 'isActive' }`} id="mu" to="/manage/students">
                Manage students
              </Link>
              <Link className={`navLink collapse ms-4 list-group-item list-group-item-action my-2 py-2 ripple ${ isActive('/manage/teachers') && 'isActive' }`} id="mu" to="/manage/teachers">
                Manage teachers
              </Link>

              <button className="navLink ms-3 link-style list-group-item sidebar list-group-item-action my-2 py-2 ripple" data-bs-toggle="collapse" data-bs-target="#mmp">
                <i className="bi bi-coin"></i> Manage merit points
              </button>
              <Link className={`navLink collapse ms-4 list-group-item list-group-item-action my-2 py-2 ripple ${ isActive('/merit_points_rules') && 'isActive' }`} id="mmp" to="/merit_points_rules">
                Merit points rules
              </Link>
              <Link className={`navLink collapse ms-4 list-group-item list-group-item-action my-2 py-2 ripple ${ isActive('/edit_merit_points') && 'isActive' }`} id="mmp" to="/edit_merit_points">
                Edit students merit points
              </Link>
              {/* <Link to="/announcements" className="navLink list-group-item list-group-item-action my-2 py-2 ripple" aria-current="true">
                <i className="bi bi-megaphone"></i> Announcements
              </Link> */}
            </div>
          </div>
        </nav>
      </header>
    </>
  )
}

export default AdminDashboardSidebar
