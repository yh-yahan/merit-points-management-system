import { Link } from 'react-router-dom'

function Signup({ isLoggedIn }){
  return(
    <>
      <div className="container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8 col-sm-10">
              <div className="shadow-lg p-5">
                <div className="card-body">
                  <h2 className="text-center mb-4">Sign up</h2>
                  <form>
                    <div className="form-floating mb-3">
                      <input type="text" className="form-control" />
                      <label>Full name</label>
                    </div>
                    <div className="form-floating mb-3">
                      <input type="text" className="form-control" />
                      <label>Username</label>
                    </div>
                    <div className="form-floating mb-3">
                      <input type="email" className="form-control" />
                      <label>Email</label>
                    </div>
                    <select className="form-select mb-3 p-3">
                      <option value="" disabled selected>Select year</option>
                      <option value="year 7">Year 7</option>
                      <option value="year 8">Year 8</option>
                      <option value="year 9">Year 9</option>
                      <option value="year 10">Year 10</option>
                      <option value="year 11">Year 11</option>
                    </select>
                    <select className="form-select mb-3 p-3">
                      <option value="" disabled selected>Select stream</option>
                      <option value="Science">Science</option>
                      <option value="Business">Business</option>
                    </select>
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

export default Signup