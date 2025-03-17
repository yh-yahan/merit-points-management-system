import { Routes, Route } from "react-router-dom"
import TeacherDashboard from './TeacherDashboard.jsx'
import TeacherEditMeritPoints from "./TeacherEditMeritPoints.jsx";
import Leaderboard from "../Utility/Leaderboard.jsx";

function Teacher({ setIsLoggedIn }){
  return (
    <>
      <Routes>
        <Route path="/" element={<TeacherDashboard />} />
        <Route path="/manage-merit-points" element={<TeacherEditMeritPoints />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </>
  );
}

export default Teacher
