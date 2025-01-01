function AdminSettings() {
  return (
    <div className="container-fluid ms-5 mt-3">
      <h1 className="my-3">Settings</h1>
      <div>
        <h3 style={{ color: "#7d7d7d" }}>Leaderboard Settings & Student Preferences</h3>
        <div className="ms-5 container">
          <div className="row">
            <div className="col-12 d-flex justify-content-between align-items-center mb-3 border-bottom border-secondary-subtle p-3">
              <p>Disable leaderboard</p>
              <button className="btn btn-primary">Disable</button>
            </div>

            <div className="col-12 d-flex justify-content-between align-items-center mb-3 border-bottom border-secondary-subtle p-3">
              <p>Allow Students to choose whether to be displayed on leaderboard.</p>
              <button className="btn btn-primary">Enable</button>
            </div>

            <div className="col-12 mb-3 d-flex justify-content-between align-items-center border-bottom border-secondary-subtle p-3">
              <p>How name is displayed on leaderboard</p>
              <select className="form-select mt-3">
                <option>Display username</option>
                <option>Display actual name</option>
                <option>Allow students to choose (username/actual name)</option>
              </select>
            </div>

            <div className="col-12 mb-3 border-bottom border-secondary-subtle p-3">
              <div className="d-flex flex-column">
                <p>Leaderboard Participation control</p>
                <p className="fw-light fs-6 text-body-secondary">
                  Determines which student won't be displayed on leaderboard
                </p>
              </div>
              <button className="btn btn-primary float-end">Add students to be excluded</button>
            </div>

            <div className="col-12 mb-3 border-bottom border-secondary-subtle p-3">
              <div className="d-flex flex-column">
                <p>Reset Leaderboard</p>
                <p className="fw-light fs-6 text-danger">
                  Warning: This will reset the leaderboard for all students
                </p>
              </div>
              <button className="btn btn-primary float-end">Reset</button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ color: "#7d7d7d" }}>Appearance</h3>
        <div className="ms-5 container">
          <div className="row">
            <div className="col-12 mb-3 d-flex justify-content-between align-items-center border-bottom border-secondary-subtle p-3">
              <p>Theme</p>
              <div className="ms-5 my-3">
                <button className="btn btn-primary me-3">Light</button>
                <button className="btn btn-primary">Dark</button>
              </div>
            </div>
            <div>
              <h6>Website</h6>
              <div className="ms-5 mb-2">
                <p className="text-danger">Warning: This will effect the entire site.</p>
              </div>
              <div className="ms-5 mb-3">
                <div className="d-flex justify-content-between align-items-center border-bottom border-secondary-subtle p-3">
                  <p>Logo</p>
                  <input type="file" />
                </div>
                <div className="mt-3">
                  <h6>Color scheme</h6>
                  <div>
                    <div className="d-flex justify-content-between align-items-center border-bottom border-secondary-subtle p-3">
                      <p>Primary color</p>
                      <input type="color" />
                    </div>
                    <div className="d-flex justify-content-between align-items-center border-bottom border-secondary-subtle p-3">
                      <p>Secondary color</p>
                      <input type="color" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ color: "#7d7d7d" }}>Account</h3>
        <div className="ms-5 container">
          <h6>Basic information</h6>
          <div className="row ms-3">
            <div className="form-floating mb-3 col-6">
              <input 
                type="text" 
                class="form-control" 
                id="floatingInput" 
                placeholder="First Name" 
                value="First name" 
              />
              <label for="floatingInput">First Name</label>
            </div>
            <div className="form-floating mb-3 col-6">
              <input 
                type="text" 
                class="form-control" 
                id="floatingInput" 
                placeholder="Last Name" 
                value="Last name" 
              />
              <label for="floatingInput">Last Name</label>
            </div>
            <div class="form-floating mb-3">
              <input 
                type="email" 
                class="form-control" 
                id="floatingInput" 
                placeholder="Email" 
                value="admin@example.com" 
              />
              <label for="floatingInput">Email address</label>
            </div>
            <div class="form-floating mb-3">
              <input 
                type="password" 
                class="form-control" 
                id="floatingInput" 
                placeholder="Password" 
                value="adminPassword" 
              />
              <label for="floatingInput">Password</label>
            </div>
          </div>
          <button className="btn btn-primary me-3 px-5">Update</button>
          <button className="btn btn-primary px-5">Cancel</button>
        </div>
        <div className="ms-5 container mt-5">
          <h6>Change Password</h6>
          <div className="row ms-3">
            <div className="form-floating mb-3">
              <input 
                type="password" 
                class="form-control" 
                id="floatingInput" 
                placeholder="Current password"
              />
              <label for="floatingInput">Current Password</label>
            </div>
            <div className="form-floating mb-3">
              <input 
                type="password" 
                class="form-control" 
                id="floatingInput" 
                placeholder="New password" 
              />
              <label for="floatingInput">New Password</label>
            </div>
            <div class="form-floating mb-3">
              <input 
                type="password" 
                class="form-control" 
                id="floatingInput" 
                placeholder="Confirm new password" 
              />
              <label for="floatingInput">Confirm new password</label>
            </div>
          </div>
          <button className="btn btn-primary me-3 px-5">Update</button>
          <button className="btn btn-primary px-5">Cancel</button>
        </div>
        <div className="ms-5 container mt-5">
          <h6>Account Deletion</h6>
          <p className="text-danger">Warning: This will delete your account and all associated data.</p>
          <p>Enter your password to confirm</p>
          <div className="form-floating mb-3">
            <input 
              type="password" 
              class="form-control" 
              id="floatingInput" 
            />
            <label for="floatingInput">Password</label>
          </div>
          <button className="btn btn-danger">Delete Account</button>
        </div>
        <div className="ms-5 container mt-5">
          <h6>Add new admin account</h6>
          <div className="row ms-3">
            <div className="form-floating mb-3 col-6">
              <input 
                type="text" 
                class="form-control" 
                id="floatingInput" 
                placeholder="First Name" 
              />
              <label for="floatingInput">First Name</label>
            </div>
            <div className="form-floating mb-3 col-6">
              <input 
                type="text" 
                class="form-control" 
                id="floatingInput" 
                placeholder="Last Name" 
              />
              <label for="floatingInput">Last Name</label>
            </div>
            <div class="form-floating mb-3">
              <input 
                type="email" 
                class="form-control" 
                id="floatingInput" 
                placeholder="Email" 
              />
              <label for="floatingInput">Email address</label>
            </div>
            <div class="form-floating mb-3">
              <input 
                type="password" 
                class="form-control" 
                id="floatingInput" 
                placeholder="Password" 
              />
              <label for="floatingInput">Password</label>
            </div>
            <div class="form-floating mb-3">
              <input 
                type="password" 
                class="form-control" 
                id="floatingInput" 
                placeholder="Confirm Password" 
              />
              <label for="floatingInput">Confirm Password</label>
            </div>
          </div>
          <button className="btn btn-primary me-3 px-5">Add</button>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;
