import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import api from '../../../api';

function TeacherSignup({ isLoggedIn, setUser, setIsLoggedIn }){
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  async function handleTeacherSignup(e){
    e.preventDefault();
    try{
      const response = await api.post('teacher/signup', {
        'name': name, 
        'email': email, 
        'password': password, 
        'password_confirmation': passwordConfirm, 
        'description': ''
      });

      setUser(response.data);
      setIsLoggedIn(true);

      setNameError("");
      setEmailError("");
      setPasswordError("");
      setError("");

      navigate('/');
    }
    catch(err){
      setNameError("");
      setEmailError("");
      setPasswordError("");
      setError("");
      
      if(err.response){
        const errors = err.response.data.errors;
  
        if(err.response && err.response.status === 422){
          if(errors.email || errors.password || errors.name){
            setNameError(errors.name);
            setEmailError(errors.email);
            setPasswordError(errors.password);
          }
      }
      else{
        setError("Something went wrong. Please try again later.");
      }
    }
    }
  }

  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <div className="container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8 col-sm-10">
              <div className="shadow-lg p-5">
                <div className="card-body">
                  <h2 className="text-center mb-4">Sign up</h2>
                  <form onSubmit={handleTeacherSignup}>
                    <div className="form-floating mb-3">
                      <input 
                      type="text" 
                      className="form-control" 
                      onChange={(e) => setName(e.target.value)}/>
                      <label>Name</label>
                    </div>
                    {nameError && <div className="text-danger mb-3">{nameError}</div>}
                    <div className="form-floating mb-3">
                      <input 
                      type="text" 
                      className="form-control" 
                      onChange={(e) => setEmail(e.target.value)}/>
                      <label>Email</label>
                    </div>
                    {emailError && <div className="text-danger mb-3">{emailError}</div>}
                    <div className="form-floating mb-3">
                      <input 
                      type={showPassword ? 'text' : 'password'} 
                      className="form-control" 
                      onChange={(e) => setPassword(e.target.value)}/>
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
                      onChange={(e) => setPasswordConfirm(e.target.value)}/>
                      <label>Confirm password</label>
                    </div>
                    {passwordError && <div className="text-danger mb-3">{passwordError}</div>}
                    {error && <div className="text-danger mb-3">{error}</div>}
                    <div className="d-grid">
                      <button className="btn" style={{ backgroundColor: "#c20008", color: "white", transition: "background-color 0.3s" }} onMouseOver={ (e) => e.target.style.backgroundColor = "black" } onMouseOut={ (e) => e.target.style.backgroundColor = "#c20008" } type="submit">
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

export default TeacherSignup