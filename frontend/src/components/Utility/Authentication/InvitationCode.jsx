import Signup from "./Signup.jsx"
import { useState } from 'react'
import { Link } from 'react-router-dom'

function InvitationCode({ isLoggedIn }){
  const [invitationCode, setInvitationCode] = useState("");
  const [showSignup, setShowSignup] = useState(false);
  const [error, setError] = useState("");

  function handleInvitationCode(e) {
    e.preventDefault();
    setShowSignup(true);
  }

  if (showSignup) {
    return <Signup isLoggedIn={isLoggedIn} />;
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
                  <form onSubmit={handleInvitationCode}>
                    <div className="form-floating mb-3">
                      <input type="text" 
                        className="form-control" 
                        onChange={(e) => setInvitationCode(e.target.value)}
                      />
                      <label>Invitation code</label>
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