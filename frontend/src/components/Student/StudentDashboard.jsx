import { useState, useEffect } from 'react';
import api from '../../api';

function StudentDashboard() {
  const [studentName, setStudentName] = useState();
  const [totalPoints, setTotalPoints] = useState();
  const [monthlyPointsAwarded, setMonthlyPointsAwarded] = useState();
  const [monthlyPointsDeducted, setMonthlyPointsDeducted] = useState();
  const [recentActivities, setRecentActivities] = useState({
    titles: [],
    diffInWordsList: [],
    ruleNames: [],
    descriptions: [],
    cardSignatures: [],
    formattedCreatedAt: [],
  });

  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await api.get('/student/dashboard');
        const data = response.data;
        setStudentName(data['student'].name);
        setTotalPoints(data.totalPoints);
        setMonthlyPointsAwarded(data.monthlyPointsAwarded);
        setMonthlyPointsDeducted(data.monthlyPointsDeducted);
        setRecentActivities({
          titles: data['recentActivities'].titles,
          diffInWordsList: data['recentActivities'].diffInWordsList,
          ruleNames: data['recentActivities'].ruleNames,
          descriptions: data['recentActivities'].descriptions,
          cardSignatures: data['recentActivities'].cardSignatures,
          formattedCreatedAt: data['recentActivities'].formattedCreatedAt,
        });

        setError("");
      }
      catch (err) {
        setError("Unable to load dashboard.");
      }
    }

    fetchData();
  }, []);

  function getGreeting() {
    const currentHour = new Date().getHours();

    if (currentHour < 12) return 'Good Morning';
    if (currentHour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }

  return (
    <div className="mt-5 ms-3 container-fluid">
      {error && <div className="alert alert-danger">{error}</div>}
      {!error &&
        <>
          <div className="mb-3">
            <h2 className="text-secondary">{getGreeting()}, {studentName}</h2>
          </div>
          <div>
            <div className="row gx-4">
              <div className="col-sm-4">
                <div className="card shadow-sm p-3 mb-5 bg-white rounded">
                  <p className="fw-lighter fs-6">Total points</p>
                  <p>{totalPoints}</p>
                </div>
              </div>
              <div className="col-sm-4">
                <div className="card shadow-sm p-3 mb-5 bg-white rounded">
                  <p className="fw-lighter fs-6">Total points awarded this month</p>
                  <p>{monthlyPointsAwarded}</p>
                </div>
              </div>
              <div className="col-sm-4">
                <div className="card shadow-sm p-3 mb-5 bg-white rounded">
                  <p className="fw-lighter fs-6">Total points deducted this month</p>
                  <p>{monthlyPointsDeducted}</p>
                </div>
              </div>
            </div>
            <div>
              <h3>My recent point activities</h3>
              {recentActivities.titles.map((title, index) => (
                <div key={index} className="card shadow-sm p-3 mb-2 bg-white rounded">
                  <p className="fw-bold">{title}</p>
                  <p className="fw-lighter fs-6">{recentActivities.diffInWordsList[index]}</p>
                  <p>Reason: {recentActivities.ruleNames[index]}</p>
                  <div className="collapse" id={`collapse${index}`}>
                    <div>
                      <p>Description: {recentActivities.descriptions[index]}</p>
                      <p className="fw-lighter fs-6">{recentActivities.cardSignatures[index]}</p>
                      <p className="fw-lighter fs-6">{recentActivities.formattedCreatedAt[index]}</p>
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

export default StudentDashboard;
