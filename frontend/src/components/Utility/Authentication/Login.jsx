import { Link } from 'react-router-dom'
import { useState } from 'react'
import api from '../../../api.js'
import '../../css/login.css'

function Login({ setIsLoggedIn, setUserRoles }){
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  async function login(e){
    e.preventDefault();

    try{
      const response = await api.post('login', {
        email, 
        password, 
        remember, 
      });

      const { user, userType } = response.data;

      setUserRoles(userType);
      setIsLoggedIn(true);
      setError("");
    }
    catch(err){
      console.log(err);
      setError("Invalid email or password");
    }
  }

  const [showPassword, setShowPassword] = useState(false);
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
