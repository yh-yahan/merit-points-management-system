import { useEffect, useState } from "react";
import api from "../../api";

function TeacherDashboard() {
  const [recentData, setRecentData] = useState({
    titles: [],
    diffInWordsList: [],
    ruleNames: [],
    descriptions: [],
    cardSignatures: [],
    formattedCreatedAt: [],
  });

  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRecentTransactionData() {
      try {
        const recentActivityDataResponse = await api.get("/teacher/recent-transactions");
        const recentActivityData = recentActivityDataResponse.data;

        setRecentData({
          titles: recentActivityData.titles,
          diffInWordsList: recentActivityData.diffInWordsList,
          ruleNames: recentActivityData.ruleNames,
          descriptions: recentActivityData.descriptions,
          cardSignatures: recentActivityData.cardSignatures,
          formattedCreatedAt: recentActivityData.formattedCreatedAt,
        });
      }
      catch (err) {
        setError("Unable to load dashboard.");
      }
    }

    fetchRecentTransactionData();
  }, []);

  return (
    <div className="mt-5 ms-3 container-fluid">
      {error && <div className="alert alert-danger">{error}</div>}
      {!error && <>
        <div className="ms-5">
          <div>
            <h3>Recent merit points activities</h3>
            {recentData.titles.map((title, index) => (
              <div key={index} className="card shadow-sm p-3 mb-2 rounded">
                <p className="fw-bold">{title}</p>
                <p className="fw-lighter fs-6">{recentData.diffInWordsList[index]}</p>
                <p>Reason: {recentData.ruleNames[index]}</p>
                <div className="collapse" id={`collapse${index}`}>
                  <div>
                    <p>Description: {recentData.descriptions[index]}</p>
                    <p className="fw-lighter fs-6">{recentData.cardSignatures[index]}</p>
                    <p className="fw-lighter fs-6">{recentData.formattedCreatedAt[index]}</p>
                  </div>
                </div>
                <p className="d-inline-flex gap-1">
                  <button
                    className="btn show-detail-btn mt-3"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse${index}`}
                    aria-expanded="false"
                    aria-controls={`collapse${index}`}>
                    Show details
                  </button>
                </p>
              </div>
            ))}
          </div>
        </div>
      </>
      }
    </div>
  );
}

export default TeacherDashboard;
