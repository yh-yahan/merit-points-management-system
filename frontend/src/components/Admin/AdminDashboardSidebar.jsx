import { Link } from 'react-router-dom'
import '../css/AdminSidebar.css'

function AdminDashboardSidebar(){
  return(
    <>
      <header>
        <nav className="collapse d-lg-block sidebar collapse bg-white">
          <div className="position-sticky">
            <div className="list-group list-group-flush mx-3 mt-4">
              <Link to="/statistics" className="list-group-item list-group-item-action my-2 py-2 ripple" aria-current="true">
                <i className="bi bi-graph-up-arrow"></i> Statistics
              </Link>
              {/* <Link to="/manage_users" className="list-group-item list-group-item-action my-2 py-2 ripple" aria-current="true">
                <i className="bi bi-people-fill"></i> Manage users
              </Link> */}
              <button className="ms-3 list-group-item sidebar list-group-item-action my-2 py-2 ripple" data-bs-toggle="collapse" data-bs-target="#mu">
                <i className="bi bi-people-fill"></i> Manage users
              </button>
              <Link className="collapse ms-4 list-group-item list-group-item-action my-2 py-2 ripple" id="mu" to="/manage_students">Manage students</Link>
              <Link className="collapse ms-4 list-group-item list-group-item-action my-2 py-2 ripple" id="mu" to="/manage_teachers">Manage teachers</Link>

              <button className="ms-3 list-group-item sidebar list-group-item-action my-2 py-2 ripple" data-bs-toggle="collapse" data-bs-target="#mmp">
                Manage merit points
              </button>
              <Link className="collapse ms-4 list-group-item list-group-item-action my-2 py-2 ripple" id="mmp" to="/merit_points_rules">Merit point's rules</Link>
              <Link className="collapse ms-4 list-group-item list-group-item-action my-2 py-2 ripple" id="mmp" to="/edit_merit_points">Edit user's merit points</Link>
              <Link to="/announcements" className="list-group-item list-group-item-action my-2 py-2 ripple" aria-current="true">
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