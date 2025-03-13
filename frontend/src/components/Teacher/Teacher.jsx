import { Routes, Route } from "react-router-dom"
import TeacherDashboard from './TeacherDashboard.jsx'

function Teacher({ setIsLoggedIn }){
  return (
    <>
      <Routes>
        <Route path="/" element={<TeacherDashboard />} />
      </Routes>
    </>
  );
}

export default Teacher