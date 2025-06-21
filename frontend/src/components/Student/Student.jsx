import { Link } from 'react-router-dom';
import StudentDashboard from './StudentDashboard';
import StudentSettings from './StudentSettings';
import Leaderboard from './StudentLeaderboard';
import { Routes, Route } from "react-router-dom";

function Student({ setIsLoggedIn }){
  return (
    <>
      <Routes>
        <Route path="/" element={<StudentDashboard />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route 
          path="/settings" 
          element={<StudentSettings setIsLoggedIn={setIsLoggedIn} />} 
        />
      </Routes>
    </>
  );
}

export default Student;
