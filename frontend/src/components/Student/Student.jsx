import { Link } from 'react-router-dom';
import StudentDashboard from './StudentDashboard';
import Leaderboard from './StudentLeaderboard';
import { Routes, Route } from "react-router-dom";

function Student(){
  return (
    <>
      <Routes>
        <Route path="/" element={<StudentDashboard />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </>
  );
}

export default Student;
