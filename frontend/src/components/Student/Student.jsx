import { Link } from 'react-router-dom'
import StudentsNavbar from './StudentsNavbar';

function Student(){
  return (
    <>
      <nav>
        <ul>
          <li><Link to="/navbar">Manage</Link></li>
          {/* Add more admin-specific links here */}
        </ul>
      </nav>
      <Routes>
        <Route path="/navbar" element={<StudentsNavbar />} />
      </Routes>
      <h1>This is student page</h1>
    </>
  );
}

export default Student