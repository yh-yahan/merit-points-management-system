import { useState, useEffect } from 'react'

function AdminManageTeachers(){
  const [search, setSearch] = useState("");
  const [profilesReview, setProfilesReview] = useState([
    {
      profilePic: 'https://www.profilebakery.com/wp-content/uploads/2023/04/AI-Profile-Picture.jpg', 
      name: 'teacherName', 
      description: 'A description...Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus.', 
      email: 'teacherEmail@example.com'
    }, 
    {
      profilePic: 'https://www.profilebakery.com/wp-content/uploads/2023/04/AI-Profile-Picture.jpg', 
      name: 'teacherName', 
      description: 'A description...Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus.', 
      email: 'teacherEmail@example.com'
    }, 
    {
      profilePic: 'https://www.profilebakery.com/wp-content/uploads/2023/04/AI-Profile-Picture.jpg', 
      name: 'teacherName', 
      description: 'A description...Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus.', 
      email: 'teacherEmail@example.com'
    }, 
    {
      profilePic: 'https://www.profilebakery.com/wp-content/uploads/2023/04/AI-Profile-Picture.jpg', 
      name: 'teacherName', 
      description: 'A description...Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus.', 
      email: 'teacherEmail@example.com'
    }, 
    {
      profilePic: 'https://www.profilebakery.com/wp-content/uploads/2023/04/AI-Profile-Picture.jpg', 
      name: 'teacherName', 
      description: 'A description...Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus.', 
      email: 'teacherEmail@example.com'
    }, 
    {
      profilePic: 'https://www.profilebakery.com/wp-content/uploads/2023/04/AI-Profile-Picture.jpg', 
      name: 'teacherName', 
      description: 'A description...Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus.', 
      email: 'teacherEmail@example.com'
    }, 
    {
      profilePic: 'https://www.profilebakery.com/wp-content/uploads/2023/04/AI-Profile-Picture.jpg', 
      name: 'teacherName', 
      description: 'A description...Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus.', 
      email: 'teacherEmail@example.com'
    }, 
    {
      profilePic: 'https://www.profilebakery.com/wp-content/uploads/2023/04/AI-Profile-Picture.jpg', 
      name: 'teacherName', 
      description: 'A description...Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus.', 
      email: 'teacherEmail@example.com'
    }, 
    {
      profilePic: 'https://www.profilebakery.com/wp-content/uploads/2023/04/AI-Profile-Picture.jpg', 
      name: 'teacherName', 
      description: 'A description...Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus.', 
      email: 'teacherEmail@example.com'
    }, 
    {
      profilePic: 'https://www.profilebakery.com/wp-content/uploads/2023/04/AI-Profile-Picture.jpg', 
      name: 'teacherName', 
      description: 'A description...Lorem ipsum dolor sit amet consectetur adipisicing elit. Natus.', 
      email: 'teacherEmail@example.com'
    }, 
  ]);
  const [filteredProfiles, setFilteredProfiles] = useState(profilesReview);

  useEffect(() => {
    let filteredTeachers = profilesReview

    if(search){
      filteredTeachers = filteredTeachers.filter(teacher => 
        teacher.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredProfiles(filteredTeachers);
  }, [search]);

  return (
    <>
      <div className="container-fluid mt-5 ms-3 me-4">
        <h1 className="mb-4">Manage teachers</h1>
        <div className="row gx-4">
          <div className="col-sm-6">
            <div className="card shadow-sm p-3 mb-5 bg-white rounded">
              <p className="fw-lighter fs-6">Total teachers</p>
              <p>9</p>
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
          {filteredProfiles.length > 0 ?
            filteredProfiles.map((profile, index) => (
              <div className="col-sm-6 col-md-4 col-lg-3">
                <a href="#" className="card-link text-decoration-none">
                  <div className="card shadow-sm p-3 mb-5 bg-white rounded text-center">
                    <div className="d-flex justify-content-center mb-2">
                      <img 
                        src={profile.profilePic} 
                        alt="Profile" 
                        className="img-fluid rounded-circle" 
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }} 
                      />
                    </div>
                    <p className="fw-bold">{profile.name}</p>
                    <p>{profile.description}</p>
                    <a href="#" className="fw-lighter">{profile.email}</a>
                  </div>
                </a>
              </div>
            )) : 
            <div className="d-flex justify-content-center mt-3" style={{height: "500px"}}>
              <p className="text-danger">No match found</p>
            </div>
          }
        </div>
      </div>
    </>
  )
}

export default AdminManageTeachers