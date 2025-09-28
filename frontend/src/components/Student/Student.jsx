import { Link } from 'react-router-dom';
import StudentDashboard from './StudentDashboard';
import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from 'react';

const Leaderboard = lazy(() => import("./StudentLeaderboard.jsx"));
const DisplayMeritPointRule = lazy(() => import("../Utility/DisplayMeritPointRule.jsx"));
const StudentSettings = lazy(() => import("./StudentSettings.jsx"));
const DisplayMeritPointThreshold = lazy(() => import("../Utility/DisplayMeritPointThreshold.jsx"));

function Student({ setIsLoggedIn }) {
  return (
    <>
      <Suspense fallback={
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
          <div className="spinner-border" style={{ color: 'var(--primary-color)' }}></div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<StudentDashboard />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route
            path="/merit-point/rules"
            element={<DisplayMeritPointRule user="student" />} />
          <Route
            path="/merit-point/threshold"
            element={<DisplayMeritPointThreshold user="student" />} />
          <Route
            path="/settings"
            element={<StudentSettings setIsLoggedIn={setIsLoggedIn} />}
          />
        </Routes>
      </Suspense>
    </>
  );
}

export default Student;
