import { Link } from 'react-router-dom';
import StudentDashboard from './StudentDashboard';
import StudentSettings from './StudentSettings';
import Leaderboard from './StudentLeaderboard';
import DisplayMeritPointRule from '../Utility/DisplayMeritPointRule';
import DisplayMeritPointThreshold from '../Utility/DisplayMeritPointThreshold';
import { Routes, Route } from "react-router-dom";

function Student({ setIsLoggedIn }) {
  return (
    <>
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
    </>
  );
}

export default Student;
