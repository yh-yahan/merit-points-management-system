import { Routes, Route } from "react-router-dom";
import TeacherDashboard from './TeacherDashboard.jsx';
import { lazy, Suspense } from 'react';

const TeacherEditMeritPoints = lazy(() => import("./TeacherEditMeritPoints.jsx"));
const Leaderboard = lazy(() => import("../Utility/Leaderboard.jsx"));
const DisplayMeritPointRule = lazy(() => import("../Utility/DisplayMeritPointRule.jsx"));
const DisplayMeritPointThreshold = lazy(() => import("../Utility/DisplayMeritPointThreshold.jsx"));
const TeacherSettings = lazy(() => import("./TeacherSettings.jsx"));

function Teacher({ setIsLoggedIn }) {
  return (
    <>
      <Suspense fallback={
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
          <div className="spinner-border" style={{ color: 'var(--primary-color)' }}></div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<TeacherDashboard />} />
          <Route path="/manage-merit-points" element={<TeacherEditMeritPoints />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route
            path="/merit-point/rules"
            element={<DisplayMeritPointRule user="teacher" />} />
          <Route
            path="/merit-point/threshold"
            element={<DisplayMeritPointThreshold user="teacher" />} />
          <Route
            path="/settings"
            element={<TeacherSettings
              setIsLoggedIn={setIsLoggedIn} />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default Teacher
