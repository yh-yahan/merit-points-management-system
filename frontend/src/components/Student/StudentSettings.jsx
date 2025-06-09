import "../css/StudentSettings.css"

function StudentSettings() {
  return (
    <div className="container-fluid px-3 px-md-5 mt-3">
      <div>
        {/* ---Visible only when configured by an admin--- */}
        <div className="mb-5">
          <h3 style={{ color: "#7d7d7d" }}>Leaderboard Settings</h3>
          <div className="ms-2 container">
            <div className="row">
              <div className="col-12 d-flex justify-content-between align-items-center mb-3 border-bottom border-secondary-subtle p-3">
                <div className="d-flex flex-column">
                  <p>Appear on leaderboard</p>
                  <p className="fw-light fs-6 text-body-secondary">
                    Control whether your performance is shown on the leaderboard.
                  </p>
                </div>
                <div className="w-50 d-flex justify-content-end">
                  <label className="switch">
                    <input type="checkbox" />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>
              <div className="col-12 d-flex justify-content-between align-items-center mb-3 border-bottom border-secondary-subtle p-3">
                <p>Leaderboard name preference</p>
                <select className="form-select">
                  <option value="name" selected>Display name</option>
                  <option value="username">Display username</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        {/* ---------------------------- */}

        <div>
          <h3 style={{ color: "#7d7d7d" }}>Account</h3>
          <div className="px-3 px-md-5 mb-5">
            <h6 style={{ color: "#7d7d7d" }}>Basic information</h6>
            <div className="row">
              <div className="form-floating mb-3">
                <input
                  type="text"
                  className="form-control"
                  id="floatingInputName"
                  placeholder="Name"
                  value="Name"
                />
                <label for="floatingInputName">Name</label>
              </div>
              <div className="form-floating mb-3">
                <input
                  type="text"
                  className="form-control"
                  id="floatingInputUsername"
                  placeholder="Username"
                  value="Username"
                />
                <label for="floatingInputUsername">Username</label>
              </div>
              <div className="form-floating mb-3">
                <input
                  type="email"
                  className="form-control"
                  id="floatingInputEmail"
                  placeholder="Email"
                  value="Email"
                />
                <label for="floatingInputEmail">Email</label>
              </div>
              <div>
                <label className="text-secondary">Class</label>
                <select className="form-select mb-3 p-3">
                  <option value="" disabled selected>Select Class</option>
                  <option value="Year 7">Year 7</option>
                  <option value="Year 8">Year 8</option>
                  <option value="Year 9">Year 9</option>
                  <option value="Year 10">Year 10</option>
                  <option value="Year 11">Year 11</option>
                </select>
              </div>
              <div>
                <label className="text-secondary">Stream</label>
                <select className="form-select mb-3 p-3">
                  <option value="" disabled selected>Select Stream</option>
                  <option value="Science">Science</option>
                  <option value="Business">Business</option>
                  <option value="None">None</option>
                </select>
              </div>
            </div>
            <button className="btn btn-primary me-3 px-5">Update</button>
            <button className="btn btn-primary px-5">Cancel</button>
          </div>
          <div className="px-3 px-md-5">
            <h6 style={{ color: "#7d7d7d" }}>Change password</h6>
            <div className="row">
              <div className="form-floating mb-3">
                <input
                  type="password"
                  class="form-control"
                  id="floatingInputCurrentPassword"
                  placeholder="Current password"
                  autoComplete="new-password"
                />
                <label for="floatingInputCurrentPassword">Current Password</label>
                <i
                  className={`bi bi-eye-fill position-absolute`}
                  style={{ top: '50%', right: '25px', transform: 'translateY(-50%)', cursor: 'pointer' }}
                ></i>
              </div>
              <div className="form-floating mb-3">
                <input
                  type="password"
                  class="form-control"
                  id="floatingInputNewPassword"
                  placeholder="New password"
                  autoComplete="new-password"
                />
                <label for="floatingInputNewPassword">New Password</label>
                <i
                  className={`bi bi-eye-fill position-absolute`}
                  style={{ top: '50%', right: '25px', transform: 'translateY(-50%)', cursor: 'pointer' }}
                ></i>
              </div>
              <div className="form-floating mb-3">
                <input
                  type="password"
                  class="form-control"
                  id="floatingInputConfirmNewPassword"
                  placeholder="New password"
                  autoComplete="new-password"
                />
                <label for="floatingInputConfirmNewPassword">Confirm New Password</label>
                <i
                  className={`bi bi-eye-fill position-absolute`}
                  style={{ top: '50%', right: '25px', transform: 'translateY(-50%)', cursor: 'pointer' }}
                ></i>
              </div>
            </div>
            <button className="btn btn-primary me-3 px-5">Update</button>
            <button className="btn btn-primary px-5">Cancel</button>
          </div>
        </div>
      </div>
      
      {/* Password update confirmation */}
      {/* <div className="popup d-flex justify-content-center align-items-center">
        <div className="popup-content p-4 bg-white rounded shadow">
          <h5>Confirm password update</h5>
          <p>Are you sure you want to update your password?</p>
          <p className="fw-light fst-italic text-danger">You will be automatically logged out once you updated your password.</p>
          <div className="d-flex justify-content-end">
            <button className="btn btn-primary me-3"
            >Yes, update</button>
            <button className="btn btn-secondary">Cancel</button>
          </div>
        </div>
      </div> */}
    </div>
  );
}

export default StudentSettings;
