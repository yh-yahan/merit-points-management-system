import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api";

function AdminInvitationCode() {
  const [invitationCodes, setInvitationCodes] = useState([]);
  const [popup, setPopup] = useState(false);
  const [invitationCodeId, setInvitationCodeId] = useState(null);
  const [error, setError] = useState("");
  const [deletionError, setDeletionError] = useState("");

  useEffect(() => {
    async function fetchInvitationCodes() {
      try {
        const response = await api.get("/admin/invitation-code");
        setInvitationCodes(response.data);
        setError("");
      }
      catch (err) {
        setError("Unable to fetch invitation codes.");
      }
    }

    fetchInvitationCodes();
  }, []);

  async function invCodeDeletion() {
    try {
      const response = await api.delete(`/admin/invitation-code/${invitationCodeId}`);
      if (response.status === 200) {
        try {
          const response = await api.get("/admin/invitation-code");
          setInvitationCodes(response.data);
          setPopup(false);
          setError("");
        } catch (err) {
          setError("Unable to fetch invitation codes.");
        }
      }
      setDeletionError("");
    } catch (err) {
      setDeletionError("Unable to delete invitation code.");
    }
  }

  function calculateValidityPeriod(createdAt, validUntil) {
    const createdDate = new Date(createdAt);
    const validUntilDate = new Date(validUntil);
    const diffTime = Math.abs(validUntilDate - createdDate);
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays == 1) {
      return "1 Day";
    }
    else if (diffDays == 2) {
      return "2 Days";
    }
    else if (diffDays == 7) {
      return "1 Week";
    }
  }

  function handleDeleteClick(id) {
    setInvitationCodeId(id);
    setPopup(true);
  }

  const invitationCodeToDelete = invitationCodes.find(code => code.id === invitationCodeId);

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Manage invitation codes</h2>
        <Link to="/invitation-code/create">
          <button className="btn me-5">
            Create new invitation code
          </button>
        </Link>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {invitationCodes.length <= 0 && <div className="alert alert-info">No invitation codes to display. Click the "Create new invitation code" button to create one.</div>}
      {!error && invitationCodes.length > 0 && (
        <div className="table-container shadow rounded table-responsive">
          <table className="table table-borded table-striped">
            <thead className="bg-primary text-light">
              <tr>
                <th>Code</th>
                <th>User role</th>
                <th>Validity</th>
                <th>Created date</th>
                <th>Expiration date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {
                invitationCodes.map(invitationCode => {
                  const validity = calculateValidityPeriod(invitationCode.created_at, invitationCode.valid_until);

                  return (
                    <tr key={invitationCode.id}>
                      <td>{invitationCode.code}</td>
                      <td>{invitationCode.for_user_type}</td>
                      <td>{validity}</td>
                      <td>{invitationCode.created_at}</td>
                      <td>{invitationCode.valid_until}</td>
                      <td>
                        <button className="btn btn-danger" onClick={() => handleDeleteClick(invitationCode.id)}>
                          <i className="bi bi-trash3"></i> Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>
      )}
      { popup &&
        <div className="popup d-flex justify-content-center align-items-center">
          <div className="popup-content p-4 bg-white rounded shadow">
            <h5>Confirm deletion</h5>
            <p>Are you sure you want to delete the invitation code '{invitationCodeToDelete.code}'?</p>
            <p className="fw-light text-danger">This action will permanently delete the invitation code and cannot be undone.</p>
            <div className="d-flex justify-content-end">
              <button className="btn btn-danger me-3" onClick={() => invCodeDeletion()}>Delete</button>
              <button className="btn btn-secondary" onClick={() => setPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      }
      { deletionError && 
        <div className="popup d-flex justify-content-center align-items-center">
          <div className="popup-contend p-4 bg-white rounded shadow">
            <h5>Error</h5>
            <p className="text-danger">{deletionError}</p>
            <div className="d-flex justify-content-end">
              <button className="btn btn-primary" onClick={() => {
                setDeletionError("");
                setPopup(false);
              }}>Ok</button>
            </div>
          </div>
        </div>
      }
    </div>
  );
}

export default AdminInvitationCode;
