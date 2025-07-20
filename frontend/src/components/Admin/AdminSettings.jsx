import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";

function AdminSettings({ setIsLoggedIn }) {
  const [settings, setSettings] = useState({
    disable_leaderboard: false,
    allow_students_to_opt_in_leaderboard: false,
    leaderboard_visibility: "username",
    logo: "",
    primary_color: "",
  });

  const [initialPoints, setInitialPoints] = useState('');
  const [hasInitialPointsChanged, setHasInitialPointsChanged] = useState(false);
  const [pointThreshold, setPointThreshold] = useState({});
  const [editedPointThreshold, setEditedPointThreshold] = useState({});
  const [editingPointsThresholdId, setEditingPointsThresholdId] = useState(null);
  const [newThresholdPoints, setNewThresholdPoints] = useState('');
  const [newThresholdActions, setNewThresholdActions] = useState('');
  const [pointThresholdToDelete, setPointThresholdToDelete] = useState();
  const [pointThresholdDeleteConfirm, setPointThresholdDeleteConfirm] = useState(false);

  const [admin, setAdmin] = useState({
    unchangedName: "",
    unchangedEmail: ""
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [changedName, setChangedName] = useState("");
  const [changedEmail, setChangedEmail] = useState("");
  const [adminId, setAdminId] = useState();

  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminPasswordConfirm, setNewAdminPasswordConfirm] = useState("");
  const [newAdminInfo, setNewAdminInfo] = useState("");
  const [showNewAdminPassword, setShowNewAdminPassword] = useState(false);
  const [newAdminError, setNewAdminError] = useState("");

  const [isBasicInfoChanged, setIsBasicInfoChanged] = useState(false);
  const [passwordUpdateConfirmation, setPasswordUpdateConfirmation] = useState(false);

  const [showAdminCurrentPassword, setShowAdminCurrentPassword] = useState(false);
  const [showAdminNewPassword, setShowAdminNewPassword] = useState(false);

  const [passwordChangeError, setPasswordChangeError] = useState("");
  const [disableLeaderboardError, setDisableLeaderboardError] = useState("");

  const [logoFile, setLogoFile] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchSettingData() {
      try {
        const response = await api.get('/admin/setting');
        const data = response.data;
        const settings = data.settings;
        const accountSettings = data.accountSettings;

        const updatedSettings = settings.reduce((acc, { setting_name, setting_value }) => {
          switch (setting_name) {
            case "disable_leaderboard":
              acc.disable_leaderboard = setting_value === "1";
              break;
            case "logo":
              acc.logo = setting_value;
              break;
            case "primary_color":
              acc.primary_color = setting_value;
              break;
            default:
              break;
          }
          return acc;
        }, {});

        setAdmin(prevState => ({
          ...prevState,
          unchangedName: accountSettings[0].name,
          unchangedEmail: accountSettings[0].email,
        })
        );
        setChangedName(accountSettings[0].name);
        setChangedEmail(accountSettings[0].email);
        setSettings(updatedSettings);
        setAdminId(accountSettings[0].id);
      }
      catch (err) {
        console.error(err);
      }
    }

    async function fetchInitial() {
      try {
        const response = await api.get('admin/initial');
        const initial = response.data;
        setInitialPoints(initial.toString());
      }
      catch (err) {
        console.log(err);
      }
    }

    async function fetchPointThreshold() {
      try {
        const response = await api.get('admin/point-threshold');
        setPointThreshold(response.data);
      }
      catch (err) {
        console.log(err);
      }
    }

    fetchInitial();
    fetchPointThreshold();

    fetchSettingData();
  }, []);

  useEffect(() => {
    if (hasInitialPointsChanged && initialPoints !== '') {
      async function updateInitial() {
        try {
          await api.post('admin/initial', {
            initial: initialPoints,
          });
        } catch (err) {
          console.log(err);
        }
      }
      updateInitial();
    }
  }, [initialPoints, hasInitialPointsChanged]);

  async function changeSettings(field, value) {
    value = value.toString();
    try {
      const settings = {
        setting_name: field,
        setting_value: value
      }
      // console.log(settings);
      const response = await api.post('/admin/setting',
        settings
      );
      // console.log(response);
    }
    catch (err) {
      console.log(err);
    }
  }

  async function handlePointThresholdSave() {
    try {
      const response = await api.patch('/admin/point-threshold', {
        'id': editingPointsThresholdId,
        'points': editedPointThreshold.points,
        'actions': editedPointThreshold.actions,
      });

      setPointThreshold(response.data);
      setEditedPointThreshold({});
      setEditingPointsThresholdId(null);
    } catch (err) {
      console.log(err);
    }
  }

  async function handlePointThresholdAdd() {
    try {
      const response = await api.post('/admin/point-threshold', {
        'points': newThresholdPoints, 
        'actions': newThresholdActions, 
      });

      setPointThreshold(response.data);

      setNewThresholdPoints('');
      setNewThresholdActions('');
    } catch (err) {
      console.log(err);
    }
  }

  async function handlePointThresholdDelete() {
    try {
      const response = await api.delete(`/admin/point-threshold/${pointThresholdToDelete.id}`);

      setPointThreshold(response.data);
      setPointThresholdDeleteConfirm(false);
    } catch (err) {
      console.log(err);
    }
  }

  async function updateAdminBasicInfo() {
    try {
      const adminUserInfo = await api.patch('/admin/user-info', {
        'id': adminId,
        'name': changedName,
        'email': changedEmail
      });
      const adminUserInfoData = adminUserInfo.data[0][0];
      setChangedName(adminUserInfoData.name);
      setChangedEmail(adminUserInfoData.email);
      setAdminId(adminUserInfoData.id);
      setAdmin(prevState => ({
        ...prevState,
        unchangedName: adminUserInfoData.name,
        unchangedEmail: adminUserInfoData.email,
      })
      );
      setIsBasicInfoChanged(false);
    }
    catch (err) {
      console.log(err);
    }
  }

  async function updatePassword() {
    setPasswordUpdateConfirmation(false);
    try {
      const response = await api.patch('/admin/update-password', {
        'id': adminId,
        'current_password': currentPassword,
        'password': newPassword,
        'password_confirmation': newPasswordConfirm,
      });

      setIsLoggedIn(false);
      navigate('/');
    }
    catch (err) {
      setPasswordChangeError(err.response.data.message);
    }
  }

  async function addNewAdmin() {
    try {
      const response = await api.post('/admin/new-admin', {
        'name': newAdminName,
        'email': newAdminEmail,
        'password': newAdminPassword,
        'password_confirmation': newAdminPasswordConfirm
      });
      setNewAdminInfo(response.data.message);
      setNewAdminError("");
    }
    catch (err) {
      setNewAdminError(err.response.data.message);
    }
  }

  async function uploadLogo() {
    if (!logoFile) return;

    const formData = new FormData();
    formData.append('logo', logoFile);

    try {
      const response = await api.post('/admin/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSettings(prevState => ({
        ...prevState,
        logo: response.data.path,
      }));
    }
    catch (error) {
      console.error(error);
    }
  }

  function handleInitialPointsChange(e) {
    const value = e.target.value;
    setInitialPoints(value);
    setHasInitialPointsChanged(true);
  }

  function handleLogoChange(e) {
    const file = e.target.files[0];
    setLogoFile(file);

    if (file) {
      uploadLogo(file);
    }
  }

  function handleSettingInputChange(field, value) {
    setSettings(prevState => ({
      ...prevState,
      [field]: value,
    }));
  }

  function handlePointThresholdEdit(threshold) {
    setEditedPointThreshold({});
    setEditingPointsThresholdId(threshold.id);
  }

  function handleNameChange(e) {
    const newName = e.target.value;
    setChangedName(newName);
    setIsBasicInfoChanged(newName !== admin.unchangedName || changedEmail !== admin.unchangedEmail);
  }

  function handleEmailChange(e) {
    const newEmail = e.target.value;
    setChangedEmail(newEmail);
    setIsBasicInfoChanged(changedName !== admin.unchangedName || newEmail !== admin.unchangedEmail);
  }

  function handleBasicInfoChangeCancel() {
    setChangedName(admin.unchangedName);
    setChangedEmail(admin.unchangedEmail);
    setIsBasicInfoChanged(false);
  }

  function handlePasswordChangeCancel() {
    setCurrentPassword("");
    setNewPassword("");
    setNewPasswordConfirm("");
  }

  function handleNewAdminCancel() {
    setNewAdminName("");
    setNewAdminEmail("");
    setNewAdminPassword("");
    setNewAdminPasswordConfirm("");
  }

  function toggleAdminCurrentPasswordVisibility() {
    setShowAdminCurrentPassword(!showAdminCurrentPassword);
  }

  function toggleAdminNewPasswordVisibility() {
    setShowAdminNewPassword(!showAdminNewPassword);
  }

  function toggleNewAdminPasswordVisibility() {
    setShowNewAdminPassword(!showNewAdminPassword);
  }

  return (
    <div className="container-fluid mt-4">
      <h1 className="my-3">Settings</h1>
      <div>
        <h3 style={{ color: "#7d7d7d" }}>Leaderboard Settings & Student Preferences</h3>
        <div className="ms-md-5">
          <div className="row">
            <div className="col-12 d-flex justify-content-between align-items-center mb-3 border-bottom border-secondary-subtle p-3">
              <p>Disable leaderboard</p>
              {disableLeaderboardError && <p className="text-danger">{disableLeaderboardError}</p>}
              <button
                className="btn btn-primary"
                onClick={async () => {
                  const newDisableLeaderboard = !settings.disable_leaderboard;
                  handleSettingInputChange("disable_leaderboard", newDisableLeaderboard);
                  try {
                    await changeSettings("disable_leaderboard", newDisableLeaderboard);
                  } catch (err) {
                    console.error("Failed to update leaderboard setting:", err);
                    handleSettingInputChange("disable_leaderboard", !newDisableLeaderboard);
                    setDisableLeaderboardError("Failed to update leaderboard setting");
                  }
                }}
              >{
                  settings.disable_leaderboard ? "Enable" : "Disable"
                }</button>
            </div>

            <div className="col-12 d-flex justify-content-between align-items-center mb-3 border-bottom border-secondary-subtle p-3">
              <p>Allow Students to choose whether to be displayed on leaderboard.</p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  handleSettingInputChange("allow_students_to_opt_in_leaderboard", !settings.allow_students_to_opt_in_leaderboard);
                  changeSettings("allow_students_to_opt_in_leaderboard", !settings.allow_students_to_opt_in_leaderboard);
                }}
              >{settings.allow_students_to_opt_in_leaderboard ? "Disallow" : "Allow"}</button>
            </div>

            <div className="col-12 mb-3 d-flex justify-content-between align-items-center border-bottom border-secondary-subtle p-3">
              <p>How name is displayed on leaderboard</p>
              <select className="form-select mt-3" onChange={(e) => changeSettings("leaderboard_visibility", e.target.value)}>
                <option value="username">Display username</option>
                <option value="name">Display actual name</option>
                <option value="choose">Allow students to choose (username/actual name)</option>
              </select>
            </div>

            <div className="col-12 mb-3 border-bottom border-secondary-subtle p-3">
              <div className="d-flex flex-column">
                <p>Leaderboard Participation control</p>
                <p className="fw-light fs-6 text-body-secondary">
                  Determines which student won't be displayed on leaderboard
                </p>
              </div>
              <button
                className="btn btn-primary float-end"
              >Add students to be excluded</button>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-3">
        <h3 style={{ color: "#7d7d7d" }}>Merit points</h3>
        <div className="ms-md-5">
          <label className="mx-3">Initial points for newly joined students: </label>
          <div className="col-4 mx-3 mt-2">
            <input
              type="number"
              className="form-control"
              onChange={handleInitialPointsChange}
              value={initialPoints || ''}
            />
          </div>
        </div>
        <div className="mx-3 mt-5 ms-md-5">
          <h3 style={{ color: "#7d7d7d" }}>Point Threshold Actions</h3>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Threshold (points)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pointThreshold.length > 0 ? pointThreshold.map((threshold, index) => (
                  <tr key={index} className={editingPointsThresholdId == threshold.id ? 'table-primary' : ''}>
                    <td scope="row">
                      {editingPointsThresholdId == threshold.id ? (
                        <input
                          type="number"
                          className="form-control"
                          value={editedPointThreshold.points ?? threshold.points}
                          onChange={(e) => setEditedPointThreshold(prev => ({ ...prev, points: e.target.value }))}
                        />
                      ) : (threshold.points)}
                    </td>
                    <td>
                      {editingPointsThresholdId == threshold.id ? (
                        <input
                          type="text"
                          className="form-control"
                          value={editedPointThreshold.actions ?? threshold.actions}
                          onChange={(e) => setEditedPointThreshold(prev => ({ ...prev, actions: e.target.value }))}
                        />
                      ) : (threshold.actions)}
                    </td>
                    <td>
                      {editingPointsThresholdId == threshold.id ? (
                        <>
                          <button
                            className="btn btn-primary me-3" 
                            onClick={() => handlePointThresholdSave()}
                          >Save</button>
                          <button
                            className="btn btn-secondary" 
                            onClick={() => {
                              setEditingPointsThresholdId(null);
                              setEditedPointThreshold({});
                            }}
                          >Cancel</button>
                        </>
                      ) :
                        <>
                          <button
                            className="btn btn-primary me-3" 
                            onClick={() => handlePointThresholdEdit(threshold)}
                          >
                            <i class="bi bi-pencil-square"></i> Edit
                          </button>
                          <button
                            className="btn btn-danger" 
                            onClick={() => {
                              setPointThresholdToDelete(threshold);
                              setPointThresholdDeleteConfirm(true);
                            }}
                          >
                            <i class="bi bi-trash3"></i> Delete
                          </button>
                        </>
                      }
                    </td>
                  </tr>
                )) :
                  <div className="mb-5">
                    <p className="text-danger">Something went wrong.</p>
                  </div>
                }
                <tr className="table-secondary">
                  <td>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="points" 
                      value={newThresholdPoints} 
                      onChange={(e) => setNewThresholdPoints(e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Actions to take" 
                      value={newThresholdActions} 
                      onChange={(e) => setNewThresholdActions(e.target.value)}
                    />
                  </td>
                  <td>
                    <button
                      className="btn btn-primary me-3"
                      onClick={handlePointThresholdAdd}
                    >
                      <i class="bi bi-plus-circle"></i> Add
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ color: "#7d7d7d" }}>Appearance</h3>
        <div className="ms-md-5">
          <div className="row">
            <div>
              <h6>Website</h6>
              <div className="ms-md-5 mb-2">
                <p className="text-danger">Warning: This will effect the entire site.</p>
              </div>
              <div className="ms-md-5 mb-3">
                <div className="d-flex justify-content-between align-items-center border-bottom border-secondary-subtle p-3">
                  <p>Logo</p>
                  <input type="file" accept="image/*" onChange={handleLogoChange} />
                </div>
                <div className="mt-3">
                  <h6>Color</h6>
                  <div>
                    <div className="d-flex justify-content-between align-items-center border-bottom border-secondary-subtle p-3">
                      <div className="d-flex flex-column">
                        <p>Primary color</p>
                        <p className="fw-light fs-6 text-body-secondary">The main color of the website (button and link colors)</p>
                        <p className="fw-light fs-6 text-body-secondary fst-italic">Refresh required to see the changes</p>
                      </div>
                      <input
                        type="color"
                        value={settings.primary_color}
                        onChange={(e) => {
                          handleSettingInputChange("primary_color", e.target.value);
                          changeSettings("primary_color", e.target.value);
                        }}
                      />
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
        <div className="ms-md-5 container">
          <h6>Basic information</h6>
          <div className="row ms-md-3">
            <div className="form-floating mb-3">
              <input
                type="text"
                class="form-control"
                id="floatingInput"
                placeholder="Name"
                value={changedName}
                onChange={handleNameChange}
              />
              <label for="floatingInput">Name</label>
            </div>
            <div class="form-floating mb-3">
              <input
                type="email"
                class="form-control"
                id="floatingInput"
                placeholder="Email"
                value={changedEmail}
                onChange={handleEmailChange}
              />
              <label for="floatingInput">Email</label>
            </div>
          </div>
          <button
            className={`btn btn-primary me-3 px-5 ${isBasicInfoChanged ? "" : "disabled"}`}
            onClick={updateAdminBasicInfo}
          >Update</button>
          <button
            className={`btn btn-primary px-5 ${isBasicInfoChanged ? "" : "disabled"}`}
            onClick={handleBasicInfoChangeCancel}
          >Cancel</button>
        </div>
        <div className="ms-md-5 container mt-5">
          <h6>Change Password</h6>
          <div className="row ms-md-3">
            <div className="form-floating mb-3">
              <input
                type={showAdminCurrentPassword ? "text" : "password"}
                class="form-control"
                id="floatingInput"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <label for="floatingInput">Current Password</label>
              <i
                onClick={toggleAdminCurrentPasswordVisibility}
                className={`bi ${showAdminCurrentPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'} position-absolute`}
                style={{ top: '50%', right: '25px', transform: 'translateY(-50%)', cursor: 'pointer' }}
              ></i>
            </div>
            <div className="form-floating mb-3">
              <input
                type={showAdminNewPassword ? "text" : "password"}
                class="form-control"
                id="floatingInput"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <label for="floatingInput">New Password</label>
              <i
                onClick={toggleAdminNewPasswordVisibility}
                className={`bi ${showAdminNewPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'} position-absolute`}
                style={{ top: '50%', right: '25px', transform: 'translateY(-50%)', cursor: 'pointer' }}
              ></i>
            </div>
            <div class="form-floating mb-3">
              <input
                type={showAdminNewPassword ? "text" : "password"}
                class="form-control"
                id="floatingInput"
                placeholder="Confirm new password"
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
              />
              <label for="floatingInput">Confirm new password</label>
            </div>
            {passwordChangeError && <p className="text-danger">{passwordChangeError}</p>}
          </div>
          <button
            className={`btn btn-primary me-3 px-5 ${currentPassword && newPassword && newPasswordConfirm ? "" : "disabled"}`}
            onClick={() => setPasswordUpdateConfirmation(true)}
          >Update</button>
          <button
            className={`btn btn-primary px-5 ${currentPassword && newPassword && newPasswordConfirm ? "" : "disabled"}`}
            onClick={handlePasswordChangeCancel}
          >Cancel</button>
        </div>
        <div className="ms-md-5 container mt-5">
          <h6>Add new admin account</h6>
          <div className="row row ms-md-3">
            <div className="form-floating mb-3">
              <input
                type="text"
                class="form-control"
                id="floatingInput"
                placeholder="Name"
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
              />
              <label for="floatingInput">Name</label>
            </div>
            <div class="form-floating mb-3">
              <input
                type="email"
                class="form-control"
                id="floatingInput"
                placeholder="Email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
              />
              <label for="floatingInput">Email address</label>
            </div>
            <div class="form-floating mb-3">
              <input
                type={showNewAdminPassword ? "text" : "password"}
                class="form-control"
                id="floatingInput"
                placeholder="Password"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
              />
              <label for="floatingInput">Password</label>
              <i
                onClick={toggleNewAdminPasswordVisibility}
                className={`bi ${showNewAdminPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'} position-absolute`}
                style={{ top: '50%', right: '25px', transform: 'translateY(-50%)', cursor: 'pointer' }}
              ></i>
            </div>
            <div class="form-floating mb-3">
              <input
                type={showNewAdminPassword ? "text" : "password"}
                class="form-control"
                id="floatingInput"
                placeholder="Confirm Password"
                value={newAdminPasswordConfirm}
                onChange={(e) => setNewAdminPasswordConfirm(e.target.value)}
              />
              <label for="floatingInput">Confirm Password</label>
            </div>
          </div>
          {newAdminInfo && <p className="text-primary">{newAdminInfo}</p>}
          {newAdminError && <p className="text-danger">{newAdminError}</p>}
          <button
            className={`btn btn-primary me-3 px-5 ${newAdminName && newAdminEmail && newAdminPassword && newAdminPasswordConfirm ? "" : "disabled"}`}
            onClick={addNewAdmin}>
            Add</button>
          <button
            className={`btn btn-primary me-3 px-5 ${newAdminName || newAdminEmail || newAdminPassword || newAdminPasswordConfirm ? "" : "disabled"}`}
            onClick={handleNewAdminCancel}>Cancel</button>
        </div>
      </div>
      {
        passwordUpdateConfirmation && (
          <div className="popup d-flex justify-content-center align-items-center">
            <div className="popup-content p-4 bg-white rounded shadow">
              <h5>Confirm password update</h5>
              <p>Are you sure you want to update your password?</p>
              <p className="fw-light fst-italic text-danger">You will be automatically logged out once you updated your password.</p>
              <div className="d-flex justify-content-end">
                <button
                  className="btn btn-primary me-3"
                  onClick={updatePassword}>Yes, update</button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setPasswordUpdateConfirmation(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )
      }
      {
        pointThresholdDeleteConfirm && (
          <div className="popup d-flex justify-content-center align-items-center">
            <div className="popup-content p-4 bg-white rounded shadow">
              <h5>Confirm deletion</h5>
              <p>Are you sure you want to delete this point threshold?</p>
              <p className="fw-light text-danger">This action will permanently delete the rule and cannot be undone.</p>
              <div className="d-flex justify-content-end">
                <button className="btn btn-danger me-3" onClick={() => handlePointThresholdDelete()}>Delete</button>
                <button className="btn btn-secondary" onClick={() => setPointThresholdDeleteConfirm(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )
      }
    </div>
  );
}

export default AdminSettings;
