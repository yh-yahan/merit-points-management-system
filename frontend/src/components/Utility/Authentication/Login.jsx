import { Link } from 'react-router-dom'

function Login(){
  return(
    <>
      <div className="container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8 col-sm-10">
              <div className="shadow-lg p-5">
                <div className="card-body">
                  <h2 className="text-center mb-4">Login</h2>
                  <form>
                    <div className="form-floating mb-3">
                      <input type="email" className="form-control" />
                      <label>Email</label>
                    </div>
                    <div className="form-floating mb-3">
                      <input type="password" className="form-control" />
                      <label>Password</label>
                    </div>
                    <div className="d-grid">
                      <button className="btn" style={{ backgroundColor: "#c20008", color: "white", transition: "background-color 0.3s" }} onMouseOver={ (e) => e.target.style.backgroundColor = "black" } onMouseOut={ (e) => e.target.style.backgroundColor = "#c20008" } type="submit">
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