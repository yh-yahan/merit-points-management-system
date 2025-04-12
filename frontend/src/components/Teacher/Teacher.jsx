import { Routes, Route } from "react-router-dom"
import TeacherDashboard from './TeacherDashboard.jsx'
import TeacherEditMeritPoints from "./TeacherEditMeritPoints.jsx";
import Leaderboard from "../Utility/Leaderboard.jsx";
import TeacherSettings from "./TeacherSettings.jsx";

function Teacher({ setIsLoggedIn }){
  return (
    <>
      <Routes>
        <Route path="/" element={<TeacherDashboard />} />
        <Route path="/manage-merit-points" element={<TeacherEditMeritPoints />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route 
        path="/settings" 
        element={<TeacherSettings 
        setIsLoggedIn={setIsLoggedIn}/>} />
      </Routes>
    </>
  );
}

export default Teacher
