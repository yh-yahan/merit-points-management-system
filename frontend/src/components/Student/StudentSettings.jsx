import api from '../../api'
import { useEffect, useState } from 'react'
import "../css/StudentSettings.css"
import { useNavigate } from 'react-router-dom';

function StudentSettings({ setIsLoggedIn }) {
  const [optOutLeaderboard, setOptOutLeaderboard] = useState(undefined);
  const [leaderboardNamePreference, setLeaderboardNamePreference] = useState('');
  const [originalOptOutLeaderboard, setOriginalOptOutLeaderboard] = useState(undefined);
  const [originalLeaderboardNamePreference, setOriginalLeaderboardNamePreference] = useState('');

  const [student, setStudent] = useState({
    unchangedName: "",
    unchangedUsername: "",
    unchangedEmail: "",
    unchangedClass: "",
    unchangedStream: "",
  });
  const [changedName, setChangedName] = useState('');
  const [changedUsername, setChangedUsername] = useState('');
  const [changedEmail, setChangedEmail] = useState('');
  const [changedClass, setChangedClass] = useState('');
  const [changedStream, setChangedStream] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [isBasicInfoChanged, setIsBasicInfoChanged] = useState(false);
  const [passwordUpdateConfirmation, setPasswordUpdateConfirmation] = useState(false);

  const [basicInfoUpdateSuccessMsg, setBasicInfoUpdateSuccessMsg] = useState();
  const [basicInfoUpdateFailMsg, setBasicInfoUpdateFailMsg] = useState();
  const [passwordUpdateError, setPasswordUpdateError] = useState();

  const navigate = useNavigate();

  useEffect(() => {
    const hasChanged = (
      changedName !== student.unchangedName ||
      changedUsername !== student.unchangedUsername ||
      changedEmail !== student.unchangedEmail ||
      changedClass !== student.unchangedClass ||
      changedStream !== student.unchangedStream
    );
    setIsBasicInfoChanged(hasChanged);
  }, [changedName, changedUsername, changedEmail, changedClass, changedStream, student]);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const response = await api.get('student/settings');
        const data = response.data;

        if (data.leaderboard_settings) {
          if ('opt_out_lb' in data.leaderboard_settings) {
            setOptOutLeaderboard(data.leaderboard_settings.opt_out_lb);
            setOriginalOptOutLeaderboard(data.leaderboard_settings.opt_out_lb);
          }
          if ('lb_visibility' in data.leaderboard_settings) {
            setLeaderboardNamePreference(data.leaderboard_settings.lb_visibility);
            setOriginalLeaderboardNamePreference(data.leaderboard_settings.lb_visibility);
          }
        }

        if (data.student) {
          setStudent({
            unchangedName: data.student.name,
            unchangedUsername: data.student.username,
            unchangedEmail: data.student.email,
            unchangedClass: data.student.class,
            unchangedStream: data.student.stream,
          });

          setChangedName(data.student.name);
          setChangedUsername(data.student.username);
          setChangedEmail(data.student.email);
          setChangedClass(data.student.class);
          setChangedStream(data.student.stream);
        }
      }
      catch (err) {
        console.log(err);
      }
    }

    fetchSettings();
  }, []);

  async function updateLeaderboardSettings() {
    try {
      const response = await api.post('/student/settings', {
        'opt_out_lb': optOutLeaderboard,
        'name_preference_lb': leaderboardNamePreference,
      });
      const data = response.data;

      setOriginalLeaderboardNamePreference(data.setting.name_preference_lb);
      setOriginalOptOutLeaderboard(data.setting.opt_out_lb);
    }
    catch (err) {
      console.log(err);
    }
  }

  async function updateStudentBasicInfo() {
    try {
      const response = await api.patch('/student/user-info', {
        'student_name': changedName,
        'student_username': changedUsername,
        'student_email': changedEmail,
        'student_class': changedClass,
        'student_stream': changedStream
      });
      const data = response.data;

      setStudent({
        unchangedName: data.student[0].name,
        unchangedUsername: data.student[0].username,
        unchangedEmail: data.student[0].email,
        unchangedClass: data.student[0].class,
        unchangedStream: data.student[0].stream,
      });
      setChangedName(data.student[0].name);
      setChangedUsername(data.student[0].username);
      setChangedEmail(data.student[0].email);
      setChangedClass(data.student[0].class);
      setChangedStream(data.student[0].stream);

      setIsBasicInfoChanged(false);
      setBasicInfoUpdateSuccessMsg("Updated successfully");
      setTimeout(() => {
        setBasicInfoUpdateSuccessMsg("");
      }, 5000);
    }
    catch (err) {
      console.log(err);
      setBasicInfoUpdateFailMsg("Failed to update");
      setTimeout(() => {
        setBasicInfoUpdateFailMsg("");
      }, 5000);
    }
  }

  async function updatePassword() {
    try {
      await api.patch('student/update-password', {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: newPasswordConfirm,
      });

      setIsLoggedIn(false);
      navigate('/');
    }
    catch (err) {
      console.log(err);
      setPasswordUpdateConfirmation(false);
      if (err) {
        const response = err.response;
        setPasswordUpdateError(response.data.message);
      }

      setPasswordUpdateConfirmation(false);
      setTimeout(() => {
        setPasswordUpdateError("");
      }, 5000);
    }
  }

  function handleBasicInfoChangeCancel() {
    setChangedName(student.unchangedName);
    setChangedUsername(student.unchangedUsername);
    setChangedEmail(student.unchangedEmail);
    setChangedClass(student.unchangedClass);
    setChangedStream(student.unchangedStream);
    setIsBasicInfoChanged(false);
  }

  const isLeaderboardChanged = (
    optOutLeaderboard !== originalOptOutLeaderboard ||
    leaderboardNamePreference !== originalLeaderboardNamePreference
  );

  return (
    <div className="container-fluid px-3 px-md-5 mt-3">
      <div>
        {(optOutLeaderboard !== undefined || leaderboardNamePreference) && (
          <div className="mb-5">
            <h3 style={{ color: "#7d7d7d" }}>Leaderboard Settings</h3>
            <div className="ms-2">
              <div className="row">
                {optOutLeaderboard !== undefined && (
                  <div className="col-12 d-flex justify-content-between align-items-center mb-3 border-bottom border-secondary-subtle p-3">
                    <p>Appear on leaderboard</p>
                    <div className="w-50 d-flex justify-content-end align-items-center">
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={!optOutLeaderboard}
                          onChange={(e) => setOptOutLeaderboard(!e.target.checked)}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                )}

                {leaderboardNamePreference && (
                  <div className="col-12 d-flex justify-content-between align-items-center mb-3 border-bottom border-secondary-subtle p-3">
                    <p>Leaderboard name preference</p>
                    <select
                      className="form-select"
                      value={leaderboardNamePreference}
                      onChange={(e) => setLeaderboardNamePreference(e.target.value)}
                    >
                      <option value="name">Display name</option>
                      <option value="username">Display username</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
            <button
              className={`btn btn-primary me-3 px-5 mt-5 ${isLeaderboardChanged ? "" : "disabled"}`}
              onClick={updateLeaderboardSettings}
            >Update</button>
          </div>
        )}

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
                  value={changedName}
                  onChange={(e) => setChangedName(e.target.value)}
                />
                <label for="floatingInputName">Name</label>
              </div>
              <div className="form-floating mb-3">
                <input
                  type="text"
                  className="form-control"
                  id="floatingInputUsername"
                  placeholder="Username"
                  value={changedUsername}
                  onChange={(e) => setChangedUsername(e.target.value)}
                />
                <label for="floatingInputUsername">Username</label>
              </div>
              <div className="form-floating mb-3">
                <input
                  type="email"
                  className="form-control"
                  id="floatingInputEmail"
                  placeholder="Email"
                  value={changedEmail}
                  onChange={(e) => setChangedEmail(e.target.value)}
                />
                <label for="floatingInputEmail">Email</label>
              </div>
              <div>
                <label className="text-secondary">Class</label>
                <select
                  className="form-select mb-3 p-3"
                  value={changedClass}
                  onChange={(e) => setChangedClass(e.target.value)}
                >
                  <option value="" disabled>Select Class</option>
                  <option value="Year 7">Year 7</option>
                  <option value="Year 8">Year 8</option>
                  <option value="Year 9">Year 9</option>
                  <option value="Year 10">Year 10</option>
                  <option value="Year 11">Year 11</option>
                </select>
              </div>
              <div>
                <label className="text-secondary">Stream</label>
                <select
                  className="form-select mb-3 p-3"
                  value={changedStream}
                  onChange={(e) => setChangedStream(e.target.value)}
                >
                  <option value="" disabled>Select Stream</option>
                  <option value="Science">Science</option>
                  <option value="Business">Business</option>
                  <option value="None">None</option>
                </select>
              </div>
            </div>
            {basicInfoUpdateSuccessMsg && <div className="alert alert-success">{basicInfoUpdateSuccessMsg}</div>}
            {basicInfoUpdateFailMsg && <div className="alert alert-danger">{basicInfoUpdateFailMsg}</div>}
            <button
              className={`btn btn-primary me-3 px-5 ${isBasicInfoChanged ? "" : "disabled"}`}
              onClick={updateStudentBasicInfo}
            >Update</button>
            <button
              className={`btn btn-primary px-5 ${isBasicInfoChanged ? "" : "disabled"}`}
              onClick={handleBasicInfoChangeCancel}
            >Cancel</button>
          </div>
          <div className="px-3 px-md-5">
            <h6 style={{ color: "#7d7d7d" }}>Change password</h6>
            <div className="row">
              <div className="form-floating mb-3">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  className="form-control"
                  id="floatingInputCurrentPassword"
                  placeholder="Current password"
                  autoComplete="new-password" 
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <label for="floatingInputCurrentPassword">Current Password</label>
                <i
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className={`bi ${showCurrentPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'} position-absolute`}
                  style={{ top: '50%', right: '25px', transform: 'translateY(-50%)', cursor: 'pointer' }}
                ></i>
              </div>
              <div className="form-floating mb-3">
                <input
                  type={showNewPassword ? "text" : "password"}
                  className="form-control"
                  id="floatingInputNewPassword"
                  placeholder="New password"
                  autoComplete="new-password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <label for="floatingInputNewPassword">New Password</label>
                <i
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className={`bi ${showNewPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'} position-absolute`}
                  style={{ top: '50%', right: '25px', transform: 'translateY(-50%)', cursor: 'pointer' }}
                ></i>
              </div>
              <div className="form-floating mb-3">
                <input
                  type={showNewPassword ? "text" : "password"}
                  className="form-control"
                  id="floatingInputConfirmNewPassword"
                  placeholder="New password"
                  autoComplete="new-password" 
                  value={newPasswordConfirm} 
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                />
                <label for="floatingInputConfirmNewPassword">Confirm New Password</label>
                <i
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className={`bi ${showNewPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'} position-absolute`}
                  style={{ top: '50%', right: '25px', transform: 'translateY(-50%)', cursor: 'pointer' }}
                ></i>
              </div>
            </div>
            {passwordUpdateError && <div className="alert alert-danger">{passwordUpdateError}</div>}
            <button
              className="btn btn-primary me-3 px-5"
              onClick={() => setPasswordUpdateConfirmation(true)}
            >Update</button>
            <button className="btn btn-primary px-5">Cancel</button>
          </div>
        </div>
      </div>

      {/* Password update confirmation */}
      {passwordUpdateConfirmation && (
        <div className="popup d-flex justify-content-center align-items-center">
          <div className="popup-content p-4 bg-white rounded shadow">
            <h5>Confirm password update</h5>
            <p>Are you sure you want to update your password?</p>
            <p className="fw-light fst-italic text-danger">You will be automatically logged out once you updated your password.</p>
            <div className="d-flex justify-content-end">
              <button
                className="btn btn-primary me-3"
                onClick={updatePassword}
              >Yes, update</button>
              <button
                className="btn btn-secondary"
                onClick={() => setPasswordUpdateConfirmation(false)}
              >Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentSettings;
