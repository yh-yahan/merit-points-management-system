import { useState, useEffect } from 'react';
import api from '../../api';

function AdminCreateInvitationCode() {
  const [role, setRole] = useState('student');
  const [validatyPeriod, setValidatyPeriod] = useState('twoDays');
  const [code, setCode] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [error, setError] = useState("");

  const [check, setCheck] = useState(false);

  useEffect(() => {
    const popoverTriggerList = document.querySelectorAll('[data-bs-toggle="popover"]');
    const popoverList = [...popoverTriggerList].map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
  }, []);

  async function generateInvCode() {
    try {
      const response = await api.post('/admin/create-inv-code', {
        'for_user_type': role,
        'validaty_period': validatyPeriod
      });
      const code = response.data.code;
      setCode(code);
    }
    catch (err) {
      setError("Unable to generate new invitation code.");
    }
  }

  function copyToClipboard() {
    if (code == "") {
      return;
    }
    try {
      navigator.clipboard.writeText(code);
      const copyIcon = document.getElementById('copyIcon');
      if (copyIcon) {
        const popover = new window.bootstrap.Popover(copyIcon, {
          content: 'Copied!',
          placement: 'top',
          trigger: 'manual'
        });
        popover.show();

        setTimeout(() => {
          popover.dispose();
        }, 2000);

        setTimeout(() => {
          if (!isHovered) {
            popover.hide();
          }
        }, 2000);
      }
    }
    catch (err) {
      const copyIcon = document.getElementById('copyIcon');
      if (copyIcon) {
        const popover = new window.bootstrap.Popover(copyIcon, {
          content: "Can't copy to clipboard",
          placement: 'top',
          trigger: 'manual'
        });
        popover.show();

        if (!isHovered) {
          popover.hide();
        }

        setTimeout(() => {
          popover.dispose();
        }, 2000);
      }
    }
  }

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center mb-5">
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8 col-sm-10">
            <div className="shadow-lg p-5">
              <div className="card-body">
                <h2 className="text-center mb-4">Create new invitation code</h2>
                <div>
                  <div className="form-floating mb-3">
                    <select
                      className="form-select"
                      id="roleSelect"
                      onChange={e => setRole(e.target.value)}>
                      <option selected value="student">Student</option>
                      <option value="teacher">Teacher</option>
                    </select>
                    <label for="roleSelect">User role</label>
                  </div>
                  <div className="form-floating mb-3">
                    <select
                      className="form-select"
                      id="validatySelect"
                      onChange={e => setValidatyPeriod(e.target.value)}>
                      <option selected value="oneDay">1 Day</option>
                      <option value="twoDays">2 Days</option>
                      <option value="oneWeek">1 Week</option>
                    </select>
                    <label for="validatySelect">Validity period</label>
                  </div>
                  <div className="form-floating mb-3">
                    <input type="text" className="form-control" id="code" disabled value={code} />
                    <label for="code">Generated invitation code</label>
                    <i
                      className="bi bi-copy position-absolute"
                      title="Copy to clipboard"
                      style={{
                        top: '50%',
                        right: '10px',
                        transform: 'translateY(-50%)',
                        cursor: 'pointer'
                      }}
                      onClick={copyToClipboard}
                      id="copyIcon" 
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}>
                    </i>
                  </div>
                  { error && <div className="alert alert-danger h-100">{error}</div> }
                  <div className="d-grid">
                    <button
                      className="btn"
                      onClick={generateInvCode}>Generate invitation code</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminCreateInvitationCode;
