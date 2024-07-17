import StudentSignup from "./StudentSignup.jsx"
import TeacherSignup from "./TeacherSignup.jsx"
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../../api.js'

function InvitationCode({ isLoggedIn, setUserRole, userRole, setIsLoggedIn, setUser }){
  const [invitationCode, setInvitationCode] = useState("");
  const [invitationCodePart1, setInvitationCodePart1] = useState("");
  const [invitationCodePart2, setInvitationCodePart2] = useState("");
  // const [forUserType, setForUserType] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setInvitationCode(`INV-${invitationCodePart1}-${invitationCodePart2}`);
  }, [invitationCodePart1, invitationCodePart2]);

  async function handleInvitationCodeSubmit(e){
    e.preventDefault();
    try{
      const response = await api.post('/validate_inv_code', {
        invitationCode: invitationCode
      });

      const { for_user_type } = response.data.result;
      
      setUserRole(for_user_type);
      setError('');
    }
    catch(err){
      // console.log(err);
      if (err.response.status === 429) {
        setError("Too many attempts. Please try again later.");
      } else if (err.response.status === 401) {
        setError("Invalid invitation code");
      } else {
        setError("An error occurred. Please try again later.");
      }
    }
  }
    
  if(userRole == "student"){
    return <StudentSignup 
    isLoggedIn={isLoggedIn} 
    setIsLoggedIn={setIsLoggedIn} 
    setUser={setUser}
    // userRole='student'
    />;
  }
  else if(userRole == "teacher"){
    return <TeacherSignup 
    isLoggedIn={isLoggedIn} 
    setIsLoggedIn={setIsLoggedIn} 
    setUser={setUser}
    />;
  }

  return (
    <>
      <div className="container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8 col-sm-10">
              <div className="shadow-lg p-5">
                <div className="card-body">
                  <h2 className="text-center mb-4">Sign up</h2>
                  <form onSubmit={handleInvitationCodeSubmit}>
                    <div className="mb-3">
                      <label className="form-label text-body-secondary">Invitation code</label>
                      <div className="input-group">
                        <span className="input-group-text">INV-</span>
                        <input
                          type="text"
                          className="form-control"
                          maxLength="4"
                          required 
                          onChange={(e) => setInvitationCodePart1(e.target.value)}
                        />
                        <span className="input-group-text">-</span>
                        <input
                          type="text"
                          className="form-control"
                          maxLength="4"
                          required 
                          onChange={(e) => setInvitationCodePart2(e.target.value)}
                        />
                      </div>
                    </div>
                    {error && <div className="text-danger mb-3">{error}</div>}
                    <div className="d-grid">
                      <button className="btn" 
                        style={{ backgroundColor: "#c20008", color: "white", transition: "background-color 0.3s" }} 
                        onMouseOver={ (e) => e.target.style.backgroundColor = "black" } 
                        onMouseOut={ (e) => e.target.style.backgroundColor = "#c20008" } 
                        type="submit">
                        Next
                      </button>
                    </div>
                    <p className="mt-3">Already have an account? { !isLoggedIn && <Link to="/">login</Link> }</p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default InvitationCode