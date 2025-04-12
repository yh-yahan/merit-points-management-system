import { useState, useEffect } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';

function TeacherSettings({ setIsLoggedIn }) {
  const [name, setName] = useState("");
  const [inputName, setInputName] = useState("");
  const [email, setEmail] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [description, setDescription] = useState("");
  const [inputDescription, setInputDescription] = useState("");
  const [basicInfoUpdateSuccessMsg, setBasicInfoUpdateSuccessMsg] = useState("");
  const [basicInfoUpdateFailMsg, setBasicInfoUpdateFailMsg] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newTeacherPassword, setNewTeacherPassword] = useState("");
  const [newTeacherPasswordConfirm, setNewTeacherPasswordConfirm] = useState("");

  const [isBasicInfoChanged, setIsBasicInfoChanged] = useState(false);
  const [showTeacherCurrentPassword, setShowTeacherCurrentPassword] = useState(false);
  const [showNewTeacherPassword, setShowNewTeacherPassword] = useState(false);
  const [passwordUpdateConfirmation, setPasswordUpdateConfirmation] = useState(false);
  const [passwordUpdateError, setPasswordUpdateError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    async function getSetting() {
      try {
        const response = await api.get('/teacher/setting');
        const data = response.data;
        
        setName(data[0].name);
        setEmail(data[0].email);
        setDescription(data[0].description ? data[0].description : "");
        setInputName(data[0].name);
        setInputEmail(data[0].email);
        setInputDescription(data[0].description ? data[0].description : "");
      }
      catch (err) {
        console.log(err)
      }
    }

    getSetting();
  }, []);

  function handleNameChange(e) {
    const newName = e.target.value;
    setInputName(newName);
    setIsBasicInfoChanged(newName !== name || inputEmail !== email || inputDescription !== description);
  }
  function handleEmailChange(e) {
    const newEmail = e.target.value;
    setInputEmail(newEmail);
    setIsBasicInfoChanged(inputName !== name || newEmail !== email || inputDescription !== description);
  }
  function handleDescriptionChange(e) {
    const newDescription = e.target.value;
    setInputDescription(newDescription);
    setIsBasicInfoChanged(inputName !== name || inputEmail !== email || newDescription !== description);
  }

  async function updateTeacherBasicInfo() {
    try {
      const response = await api.post('/teacher/setting', {
        name: inputName,
        email: inputEmail,
        description: inputDescription
      });
      const data = response.data;

      setName(data.teacher.name);
      setEmail(data.teacher.email);
      setDescription(data.teacher.description ? data.teacher.description : "");

      setIsBasicInfoChanged(false);
      setBasicInfoUpdateSuccessMsg("Updated successfully");
      setTimeout(() => {
        setBasicInfoUpdateSuccessMsg("");
      }, 5000);
    }
    catch(err) {
      console.log(err);
      setBasicInfoUpdateFailMsg("Failed to update");
      setTimeout(() => {
        setBasicInfoUpdateFailMsg("");
      }, 5000);
    }
  }

  async function updatePassword() {
    try {
      await api.patch('/teacher/update-password', { 
        old_password: currentPassword,
        new_password: newTeacherPassword,
        new_password_confirmation: newTeacherPasswordConfirm
      });

      setIsLoggedIn(false);
      navigate('/');
    }
    catch(err) {
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
    setInputName(name);
    setInputEmail(email);
    setInputDescription(description);
    setIsBasicInfoChanged(false);
  }

  function handlePasswordChangeCancel() {
    setCurrentPassword("");
    setNewTeacherPassword("");
    setNewTeacherPasswordConfirm("");
    setShowTeacherCurrentPassword(false);
    setShowNewTeacherPassword(false);
  }

  function toggleTeacherCurrentPasswordVisibility() {
    setShowTeacherCurrentPassword(!showTeacherCurrentPassword);
  }

  function toggleNewTeacherPasswordVisibility() {
    setShowNewTeacherPassword(!showNewTeacherPassword);
  }

  return (
    <div className="mt-5 ms-3 container-fluid">
      <h1>Account</h1>
      <div className="ms-5 container mb-5">
        <h6 style={{ color: "#7d7d7d" }}>Basic information</h6>
        <div className="mb-5">
          <p>Profile</p>
          <div>
            <img
              src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAJQAuwMBIgACEQEDEQH/xAAaAAEAAwEBAQAAAAAAAAAAAAAAAQIDBAUH/8QAKBABAAICAAUDBAMBAAAAAAAAAAECAxEEEiExQVFhkRMycYEiUqEU/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAH/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwD7iAAAAAAAACs3rHkFhn9SPST6vsDQZ/U9YTGSoLiInfZIAAAAAAAAAAAAAAClrxHTyre/iFATNpnugAAAAAIlpXJ/ZmA3idpYVtNZbRO43AJAAAAAAAAAAZ5LeI/a1p5YYgAAAdgBhk4mlelY3Pt2Z/8AVfxFdfgHWOavFddWr09Yb1tW8brMSCwAC1bcsqgOiBnit4aAAAAAAAAAyyTudeFC3WZkAAAc3FZZ3yR47ul50zuZnzIIAVBfFknHbcdvMKAPRrMTWLR2lLHhZ3j1PiWyKAAROpiW8TuNsGuOd1BcAAAAABFu0pRbtIMAAAARPaXnPSefkryX5Z8AqAqAAOvhPsn8t2fD15MUb89WiKAANMXaWa+LyDUAAAAABEpAc89xa8atKoAADLPijJG4+6P9ak9O4POmJrOpjUoehbkvH8uWWc4cM+fiwON0YMG55rxqI7e7alMVJ6cv7lfcesfIJAAAAa4vtZN6xqsAkAAAAAAAFMkdNx4ZOhjeup9gVPG56RA5eLyfy5InpHcDJxMzuMfSPVhNpnvMz+UCh0OgCHQ7dugA0x5r087j0l2Y71yV3WfzDz1sd5pbmj9or0BETuImO0pjuC2ON29obK0rqulgAAAAAAAAETG41KQGFomO7zbzu8z6y9i0bjTzs/C3xzM1/lX/AGAc4CoAAAAAvjxXyzqkb9wdXCzvFEek6dNKa6q8PgjDXW9zLZFAAAAAAAAAAAAEJAY5eGx5OuuWfWHLfgrx9ton89HoAPKtw+WvfHb9dVfpZP6W+HraSDyIw5Znpjt8NacJlt3iKx7y9I0Dlx8FSOt55p+IdMVisaiIiPZIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//Z"
              alt="Teacher"
              style={{ borderRadius: "50%" }}
            />
          </div>
          <button className="btn">Change profile picture</button>
        </div>
        <div className="form-floating mb-3">
          <input
            type="text"
            className="form-control"
            id="floatingInput"
            placeholder="Name"
            value={inputName}
            onChange={handleNameChange}
          />
          <label for="floatingInput">Name</label>
        </div>
        <div className="form-floating mb-3">
          <input
            type="email"
            className="form-control"
            id="floatingInput"
            placeholder="Email"
            value={inputEmail}
            onChange={handleEmailChange}
          />
          <label for="floatingInput">Email</label>
        </div>
        <div className="form-floating mb-3">
          <textarea 
          className="form-control" 
          placeholder="Description..." 
          id="floatingTextarea" 
          value={inputDescription}
          onChange={handleDescriptionChange} 
          style={{maxHeight: "500px", height: "100px"}}></textarea>
          <label for="floatingTextarea">Description</label>
        </div>
        {basicInfoUpdateSuccessMsg && <div className="alert alert-success">{basicInfoUpdateSuccessMsg}</div>}
        {basicInfoUpdateFailMsg && <div className="alert alert-danger">{basicInfoUpdateFailMsg}</div>}
        <button
          className={`btn btn-primary me-3 px-5 ${isBasicInfoChanged ? "" : "disabled"}`}
          onClick={updateTeacherBasicInfo}
        >Update</button>
        <button
          className={`btn btn-primary px-5 ${isBasicInfoChanged ? "" : "disabled"}`}
          onClick={handleBasicInfoChangeCancel}
        >Cancel</button>
      </div>
      <div className="ms-5 container mb-5">
        <h6 style={{ color: "#7d7d7d" }}>Change password</h6>
        <div className="form-floating mb-3">
          <input
            type={showTeacherCurrentPassword ? "text" : "password"}
            class="form-control"
            id="floatingInput"
            placeholder="Current password" 
            autoComplete="new-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <label for="floatingInput">Current Password</label>
          <i
            onClick={toggleTeacherCurrentPasswordVisibility}
            className={`bi ${showTeacherCurrentPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'} position-absolute`}
            style={{ top: '50%', right: '25px', transform: 'translateY(-50%)', cursor: 'pointer' }}
          ></i>
        </div>
        <div class="form-floating mb-3">
          <input
            type={showNewTeacherPassword ? "text" : "password"}
            class="form-control"
            id="floatingInput"
            placeholder="Password"
            autoComplete="new-password"
            value={newTeacherPassword}
            onChange={(e) => setNewTeacherPassword(e.target.value)}
          />
          <label for="floatingInput">New Password</label>
          <i
            onClick={toggleNewTeacherPasswordVisibility}
            className={`bi ${showNewTeacherPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'} position-absolute`}
            style={{ top: '50%', right: '25px', transform: 'translateY(-50%)', cursor: 'pointer' }}
          ></i>
        </div>
        <div class="form-floating mb-3">
          <input
            type={showNewTeacherPassword ? "text" : "password"}
            class="form-control"
            id="floatingInput"
            placeholder="Confirm Password"
            autoComplete="new-password"
            value={newTeacherPasswordConfirm}
            onChange={(e) => setNewTeacherPasswordConfirm(e.target.value)}
          />
          <label for="floatingInput">Confirm Password</label>
        </div>
        {passwordUpdateError && <div className="alert alert-danger">{passwordUpdateError}</div>}
        <button
          className={`btn btn-primary me-3 px-5 ${currentPassword && newTeacherPassword && newTeacherPasswordConfirm ? "" : "disabled"}`}
          onClick={() => setPasswordUpdateConfirmation(true)}
        >Update</button>
        <button
          className={`btn btn-primary me-3 px-5 ${currentPassword && newTeacherPassword && newTeacherPasswordConfirm ? "" : "disabled"}`} 
          onClick={handlePasswordChangeCancel}
        >Cancel</button>
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
                onClick={updatePassword}
                >Yes, update</button>
                <button 
                className="btn btn-secondary" 
                onClick={() => setPasswordUpdateConfirmation(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )
      }
    </div>
  );
}

export default TeacherSettings;
