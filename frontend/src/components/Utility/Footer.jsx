import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'
import api from '../../api';

function Footer(){
  const [logoUrl, setLogoUrl] = useState(null);
  
  useEffect(() => {
    async function getLogo(){
      try{
        const response = await api.get('/logo');
        setLogoUrl(response.data.path);
      }
      catch(err){
        console.log(err);
      }
    }

    getLogo();
  }, []);

  return(
    <>
      <footer className="text-lg-start bg-body-tertiary text-muted">
        <section className="">
          <div className="ms-5 text-md-start mt-5">
            <div className="row mt-3">
              <div className="col-md-3 col-lg-4 col-xl-3 ms-3 mb-4">
                <Link className="navbar-brand ms-4" to="/">
                  <div style={{ maxWidth: "73px" }}>
                    <img src={logoUrl} className="img-fluid" alt="Logo" />
                  </div>
                </Link>
                <div className="mt-5">
                  <a href="#" className="text-dark me-3"><i className="bi bi-facebook"></i></a>
                  <a href="#" className="text-dark me-3"><i className="bi bi-instagram"></i></a>
                  <a href="#" className="text-dark me-3"><i className="bi bi-linkedin"></i></a>
                </div>
              </div>
              <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mb-4">
                <h6 className="text-uppercase fw-bold mb-4">Quick links</h6>
                <p className="ms-3">
                  <Link to="/leaderboard" className="text-reset">Leaderboard</Link>
                </p>
                <p className="ms-3">
                  <Link to="/settings" className="text-reset">Settings</Link>
                </p>
                <p className="ms-3">
                  <Link to="/about" className="text-reset">About</Link>
                </p>
              </div>
              <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mb-4">
                <h6 className="text-uppercase fw-bold mb-4">Feedback & Resources</h6>
                <p className="ms-3">
                  <Link to="/feedback" className="text-reset">Feedback Form</Link>
                </p>
                {/* <p className="ms-3">
                  <Link to="/announcements" className="text-reset">Announcements</Link>
                </p> */}
                <p className="ms-3">
                  <Link to="/faq" className="text-reset">FAQs</Link>
                </p>
              </div>
              <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mb-4">
                <h6 className="text-uppercase fw-bold mb-4">Contact Us</h6>
                <p className="ms-3">
                  <a href="#" className="text-reset"><i className="bi bi-geo-alt-fill"></i> Some location...</a>
                </p>
                <p className="ms-3">
                  <a href="#" className="text-reset"><i className="bi bi-envelope-fill"></i> mail@example.com</a>
                </p>
                <p className="ms-3">
                  <a href="#" className="text-reset"><i className="bi bi-telephone-fill"></i> (+11) 11-111 1111</a>
                </p>
                <p className="ms-3">
                  <a href="#" className="text-reset"><i className="bi bi-clock-fill"></i> Monday-Friday 7am to 5pm</a>
                </p>
              </div>
            </div>
          </div>
        </section>
      </footer>
    </>
  )
}

export default Footer