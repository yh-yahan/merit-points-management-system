import { useState, useEffect } from "react";
import api from "../../api";

function MeritPointThresold({ user }) {
  const [pointThreshold, setPointThreshold] = useState([]);

  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchMeritPointThreshold() {
      try {
        const response = await api.get(`${user}/merit-point/threshold`);
        setPointThreshold(response.data);

        setError("");
      } catch (err) {
        setError("Unable to fetch merit point threshold rules.");
      }
    }

    fetchMeritPointThreshold();
  }, []);

  return (
    <div className="container-fluid min-vh-100">
      {error && <div className="alert alert-danger">{error}</div>}
      {!error && <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Threshold (points)</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pointThreshold.map((threshold, index) => (
              <tr key={index}>
                <td>{threshold.points}</td>
                <td>{threshold.actions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>}
    </div>
  );
}

export default MeritPointThresold;
