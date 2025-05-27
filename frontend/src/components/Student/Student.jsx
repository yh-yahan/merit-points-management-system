import { Link } from 'react-router-dom';
import StudentDashboard from './StudentDashboard';
import { Routes, Route } from "react-router-dom";

function Student(){
  return (
    <>
      <Routes>
        <Route path="/" element={<StudentDashboard />} />
      </Routes>
    </>
  );
}

export default Student;
