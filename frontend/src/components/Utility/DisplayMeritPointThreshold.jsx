import { useState, useEffect } from "react";
import api from "../../api";

function MeritPointThresold({ user }) {
  const [pointThreshold, setPointThreshold] = useState([]);

  useEffect(() => {
    async function fetchMeritPointThreshold() {
      try {
        const response = await api.get(`${user}/merit-point/threshold`);
        setPointThreshold(response.data);
      } catch (err) {
        console.log(err);
      }
    }

    fetchMeritPointThreshold();
  }, []);

  return (
    <div className="container-fluid min-vh-100">
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Threshold (points)</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            { pointThreshold.map((threshold, index) => (
              <tr key={index}>
                <td>{threshold.points}</td>
                <td>{threshold.actions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MeritPointThresold;
