import { useState, useEffect } from 'react'
import api from '../../api'

function AdminManageTeachers() {
  const [search, setSearch] = useState("");
  const [profilesReview, setProfilesReview] = useState([]);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const [showDeleteTeacherConfirm, setShowDeleteTeacherConfirm] = useState(false);

  async function fetchTeachersData() {
    try {
      const response = await api.get(`/admin/manage-teachers?search=${search}`);

      const transformedData = response.data.data.data.map(teacher => ({
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        profilePic: teacher.profile_pic,
        description: teacher.description,
        createdAt: teacher.created_at,
      }));

      setTotalTeachers(response.data.totalTeachers);
      setProfilesReview(transformedData);
    }
    catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    fetchTeachersData();
  }, [search]);

  async function deleteTeacher(id) {
    try {
      await api.delete(`/admin/manage-teachers/${selectedTeacher.id}`);
    
      fetchTeachersData();
  
      setSelectedTeacher(null);
      setShowDeleteTeacherConfirm(false);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <>
      <div className="container-fluid mt-5 ms-3 me-4">
        <h1 className="mb-4">Manage teachers</h1>
        <div className="row gx-4">
          <div className="col-sm-6">
            <div className="card shadow-sm p-3 mb-5 bg-white rounded">
              <p className="fw-lighter fs-6">Total teachers</p>
              <p>{totalTeachers}</p>
            </div>
            <div>
              <input
                type="text"
                className="form-control mb-3 p-2"
                placeholder="Search..."
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="row">
          {profilesReview.length > 0 ?
            profilesReview.map((profile, index) => (
              <div className="col-sm-6 col-md-4 col-lg-3">
                <div className="card shadow-sm p-3 mb-5 bg-white rounded text-center">
                  <div className="d-flex justify-content-center mb-2">
                    <img
                      src={profile.profilePic ? `${import.meta.env.VITE_BACKEND_URL}/storage/${profile.profilePic}` : "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAJQAuwMBIgACEQEDEQH/xAAaAAEAAwEBAQAAAAAAAAAAAAAAAQIDBAUH/8QAKBABAAICAAUDBAMBAAAAAAAAAAECAxEEEiExQVFhkRMycYEiUqEU/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAH/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwD7iAAAAAAAACs3rHkFhn9SPST6vsDQZ/U9YTGSoLiInfZIAAAAAAAAAAAAAAClrxHTyre/iFATNpnugAAAAAIlpXJ/ZmA3idpYVtNZbRO43AJAAAAAAAAAAZ5LeI/a1p5YYgAAAdgBhk4mlelY3Pt2Z/8AVfxFdfgHWOavFddWr09Yb1tW8brMSCwAC1bcsqgOiBnit4aAAAAAAAAAyyTudeFC3WZkAAAc3FZZ3yR47ul50zuZnzIIAVBfFknHbcdvMKAPRrMTWLR2lLHhZ3j1PiWyKAAROpiW8TuNsGuOd1BcAAAAABFu0pRbtIMAAAARPaXnPSefkryX5Z8AqAqAAOvhPsn8t2fD15MUb89WiKAANMXaWa+LyDUAAAAABEpAc89xa8atKoAADLPijJG4+6P9ak9O4POmJrOpjUoehbkvH8uWWc4cM+fiwON0YMG55rxqI7e7alMVJ6cv7lfcesfIJAAAAa4vtZN6xqsAkAAAAAAAFMkdNx4ZOhjeup9gVPG56RA5eLyfy5InpHcDJxMzuMfSPVhNpnvMz+UCh0OgCHQ7dugA0x5r087j0l2Y71yV3WfzDz1sd5pbmj9or0BETuImO0pjuC2ON29obK0rqulgAAAAAAAAETG41KQGFomO7zbzu8z6y9i0bjTzs/C3xzM1/lX/AGAc4CoAAAAAvjxXyzqkb9wdXCzvFEek6dNKa6q8PgjDXW9zLZFAAAAAAAAAAAAEJAY5eGx5OuuWfWHLfgrx9ton89HoAPKtw+WvfHb9dVfpZP6W+HraSDyIw5Znpjt8NacJlt3iKx7y9I0Dlx8FSOt55p+IdMVisaiIiPZIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//Z"}
                      alt="Profile"
                      className="img-fluid rounded-circle"
                      style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                    />
                  </div>
                  <p className="fw-bold">{profile.name}</p>
                  <p>{profile.description.length < 100 ? profile.description : `${profile.description.substring(0, 67)}...`}</p>
                  <a href="#" className="fw-lighter">{profile.email}</a>
                  <button
                    className="btn btn-danger mt-5"
                    onClick={() => {
                      setSelectedTeacher(profile);
                      setShowDeleteTeacherConfirm(true);
                    }}
                  >Delete</button>
                </div>
              </div>
            )) :
            <div className="d-flex justify-content-center mt-3" style={{ height: "500px" }}>
              <p className="text-danger">No match found</p>
            </div>
          }
        </div>
      </div>

      {
        showDeleteTeacherConfirm && (
          <div className="popup d-flex justify-content-center align-items-center">
            <div className="popup-content p-4 bg-white rounded shadow">
              <h5>Confirm deletion</h5>
              <p>Are you sure you want to delete the teacher '{selectedTeacher?.name}'?</p>
              <p className="fw-light text-danger">This action will permanently delete the user and cannot be undone.</p>
              <div className="d-flex justify-content-end">
                <button className="btn btn-danger me-3" onClick={deleteTeacher}>Delete</button>
                <button className="btn btn-secondary" onClick={() => setShowDeleteTeacherConfirm(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )
      }
    </>
  )
}

export default AdminManageTeachers