import { Link } from 'react-router-dom'
import StudentsNavbar from './StudentsNavbar'
import { Routes, Route } from "react-router-dom"

function Student(){
  return (
    <>
      {/* <nav>
        <ul>
          <li><Link to="/navbar">Manage</Link></li>
        </ul>
      </nav> */}
      <Routes>
        <Route path="/navbar" element={<StudentsNavbar />} />
      </Routes>
      <h1>This is student page</h1>
    </>
  );
}

export default Student