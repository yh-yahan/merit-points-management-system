import { Link, useNavigate } from 'react-router-dom'
import api from '../../../api'
import { useState } from 'react';
import Student from '../../Student/Student';

function Signup({ isLoggedIn, setIsLoggedIn, setUser }){
  const [fullName, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfrim] = useState("");
  const [stage, setStage] = useState("");
  const [stream, setStream] = useState("");

  // const [user, setUser] = useState("");

  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [streamError, setStreamError] = useState("");
  const [stageError, setStageError] = useState("");
  const [fullnameError, setFullnameError] = useState("");

  const navigate = useNavigate();

  async function handleStudentSignup(e){
    e.preventDefault();
    try{
      const response = await api.post('student/signup', {
        'name': fullName, 
        'username': username, 
        'email': email, 
        'password': password, 
        'password_confirmation': passwordConfirm, 
        'stage': stage, 
        'stream': stream
      });

      setUser(response);
      setIsLoggedIn(true);
      
      setEmailError("");
      setPasswordError("");
      setStageError("");
      setStreamError("");
      setFullnameError("");
      setError("");

      navigate('/');
    }
    catch(err){
      setEmailError("");
      setPasswordError("");
      setStageError("");
      setStreamError("");
      setFullnameError("");
      setError("");

      if(err.response){
        const errors = err.response.data.errors;
  
        if(err.response && err.response.status === 422){
          if(errors.email || errors.password || errors.stream || errors.stage || errors.name){
            setEmailError(errors.email);
            setPasswordError(errors.password);
            setStreamError(errors.stream);
            setStageError(errors.stage);
            setFullnameError(errors.name);
          }
        }
        else{
          setError("Something went wrong. Please try again later.");
        }
      }
    }
  }

  const [showPassword, setShowPassword] = useState(false);
  // const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return(
    <>
      <div className="container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8 col-sm-10">
              <div className="shadow-lg p-5">
                <div className="card-body">
                  <h2 className="text-center mb-4">Sign up</h2>
                  <form onSubmit={handleStudentSignup}>
                    <div className="form-floating mb-3">
                      <input type="text" 
                      className="form-control" 
                      onChange={(e) => setFullname(e.target.value)}
                      />
                      <label>Full name</label>
                    </div>
                    {fullnameError && <div className="text-danger mb-3">{fullnameError}</div>}
                    <div className="form-floating mb-3">
                      <input
                      type="text" 
                      className="form-control" 
                      onChange={(e) => setUsername(e.target.value)}
                      />
                      <label>Username</label>
                    </div>
                    <div className="form-floating mb-3">
                      <input 
                      type="email" 
                      className="form-control" 
                      onChange={(e) => setEmail(e.target.value)} 
                      />
                      <label>Email</label>
                    </div>
                    {emailError && <div className="text-danger mb-3">{emailError}</div>}
                    <div className="form-floating mb-3 position-relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-control"
                        id="password"
                        required
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <label>Password</label>
                      <i
                        onClick={togglePasswordVisibility}
                        className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'} position-absolute`}
                        style={{ top: '50%', right: '10px', transform: 'translateY(-50%)', cursor: 'pointer' }}
                      ></i>
                    </div>
                    <div className="form-floating mb-3">
                      <input 
                      type={showPassword ? 'text' : 'password'}
                      className="form-control" 
                      onChange={(e) => setPasswordConfrim(e.target.value)} 
                      />
                      <label>Confirm password</label>
                      {/* <i
                        onClick={togglePasswordVisibility}
                        className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'} position-absolute`}
                        style={{ top: '50%', right: '10px', transform: 'translateY(-50%)', cursor: 'pointer' }}
                      ></i> */}
                    </div>
                    {passwordError && <div className="text-danger mb-3">{passwordError}</div>}
                    <select 
                    className="form-select mb-3 p-3" 
                    onChange={(e) => setStage(e.target.value)}>
                      <option value="" disabled selected>Select year</option>
                      <option value="Year 7">Year 7</option>
                      <option value="Year 8">Year 8</option>
                      <option value="Year 9">Year 9</option>
                      <option value="Year 10">Year 10</option>
                      <option value="Year 11">Year 11</option>
                    </select>
                    {stageError && <div className="text-danger mb-3">{stageError}</div>}
                    <select 
                    className="form-select mb-3 p-3" 
                    onChange={(e) => setStream(e.target.value)}>
                      <option value="" disabled selected>Select stream</option>
                      <option value="Science">Science</option>
                      <option value="Business">Business</option>
                      <option value="None">None</option>
                    </select>
                    {streamError && <div className="text-danger mb-3">{streamError}</div>}
                    {error && <div className="text-danger mb-3">{error}</div>}
                    <div className="d-grid">
                      <button className="btn" 
                      style={{ backgroundColor: "#c20008", color: "white", transition: "background-color 0.3s" }} 
                      onMouseOver={ (e) => e.target.style.backgroundColor = "black" } 
                      onMouseOut={ (e) => e.target.style.backgroundColor = "#c20008" } 
                      type="submit">
                        Sign up
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
  )
}

export default Signup