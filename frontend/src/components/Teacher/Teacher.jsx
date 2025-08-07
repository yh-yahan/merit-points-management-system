import { Routes, Route } from "react-router-dom"
import TeacherDashboard from './TeacherDashboard.jsx'
import TeacherEditMeritPoints from "./TeacherEditMeritPoints.jsx";
import DisplayMeritPointRule from '../Utility/DisplayMeritPointRule';
import DisplayMeritPointThreshold from '../Utility/DisplayMeritPointThreshold';
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
          path="/merit-point/rules"
          element={<DisplayMeritPointRule user="teacher" />} />
        <Route
          path="/merit-point/threshold"
          element={<DisplayMeritPointThreshold user="teacher" />} />
        <Route 
        path="/settings" 
        element={<TeacherSettings 
        setIsLoggedIn={setIsLoggedIn}/>} />
      </Routes>
    </>
  );
}

export default Teacher
