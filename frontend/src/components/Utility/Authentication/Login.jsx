import Student from '../../Student/Student.jsx'
import Admin from '../../Admin/Admin.jsx'
import Teacher from '../../Teacher/Teacher.jsx'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import api from '../../../api.js'

function Login({ setIsLoggedIn, setUserRole, setUser, userRole }){
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // login user upon submit button pressed
  async function login(e){
    e.preventDefault();

    try{
      const response = await api.post('login', {
        email, 
        password, 
        remember, 
      });

      const { user, userType } = response.data;

      setUserRole(userType);
      setUser(user);
      setIsLoggedIn(true);
      setError("");

      navigate('/');
    }
    catch(err){
      if(err.response.status === 429){
        setError("Too many login attempts. Please try again later.");
      }
      else if(err.response.status === 401){
        setError("Invalid email or password");
      }
      else{
        setError("An error occurred. Please try again later.");
      }
    }
  }

  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // if(userRole == "student"){
  //   return <Student />
  // }
  // else if(userRole == "teacher"){
  //   return <Teacher />
  // }
  // else if(userRole == "admin"){
  //   return <Admin />
  // }

  return(
    <>
      <div className="container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8 col-sm-10">
              <div className="shadow-lg p-5">
                <div className="card-body">
                  <h2 className="text-center mb-4">Login</h2>
                  <form onSubmit={login} method="post">
                    <div className="form-floating mb-3">
                      <input type="email" 
                        className="form-control" 
                        required 
                        onChange={(e) => setEmail(e.target.value)} 
                      />
                      <label>Email</label>
                    </div>
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
                    {error && <div className="text-danger mb-3">{error}</div>}
                    <div className="d-grid">
                      <div className='position-relative mb-3'>
                        <input type="checkbox" 
                          className="me-1" id="rememberMe" 
                          onClick={() => setRemember(!remember)} 
                        />
                        <label htmlFor="rememberMe">Remember me</label>
                      </div>
                    </div>
                    <div className="d-grid">
                      <button className="btn" 
                        style={{ backgroundColor: "#c20008", color: "white", transition: "background-color 0.3s" }} 
                        onMouseOver={ (e) => e.target.style.backgroundColor = "black" } 
                        onMouseOut={ (e) => e.target.style.backgroundColor = "#c20008" } 
                        type="submit"
                      >
                        Login
                      </button>
                    </div>
                  </form>
                  <p className="mt-3">Don't have an account yet? <Link to="/signup">Sign up</Link></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login
