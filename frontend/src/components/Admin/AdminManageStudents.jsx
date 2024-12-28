import { useState, useEffect } from "react";
import api from "../../api";

// TODO: allow direct change of status in the table

function AdminManageStudents(){
  const [sort, setSort] = useState("");
  const [filter, setFilter] = useState("none");
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStudentsData(){
      try{
        const response = await api.get(`/admin/manage-students?page=${currentPage}&search=${search}&sort=${sort}&filter=${filter}`);
        const transformedData = response.data.data.map(student => ({
          id: student.id, 
          name: student.name, 
          class: student.class, 
          dateJoined: student.date_joined, 
          points: student.points, 
          email: student.email, 
          stream: student.stream, 
          status: student.status, 
        }));
        setStudents(transformedData);
        setTotalStudents(response.data.totalStudents);
        setTotalPages(response.data.last_page);
      }
      catch(err){
        setError("No data found.");
        console.log(err);
      }
    }

    fetchStudentsData();
  }, [search, sort, currentPage, filter]);

  function handleSortChange(event){
    setSort(event.target.value);
    setCurrentPage(1)
  }

  function handleFilterChange(event){
    setFilter(event.target.value);
    setCurrentPage(1)
  }

  function handleSearchChange(event){
    setSearch(event.target.value);
    setCurrentPage(1)
  }

  function handleDetails(id){

  }

  return (
    <>
      <div className="me-4 container-fluid mt-5 ms-3">
        <h1 className="mb-4">Manage students</h1>
        <div className="row gx-4">
          <div className="col-sm-3">
            <div className="card shadow-sm p-3 mb-5 bg-white rounded">
              <p className="fw-lighter fs-6">Total students</p>
              <p>{totalStudents}</p>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-4">
            <input
              type="text"
              className="form-control"
              placeholder="Search..."
              onChange={handleSearchChange}
            />
          </div>
          <div className="col-md-4">
            <select className="form-select mb-3 p-2" onChange={handleSortChange} value={sort}>
              <option value="" disabled>Sort by</option>
              <option value="nameAsc">Alphabetical order by student name</option>
              <option value="nameDesc">Descending alphabetical order by student name</option>
              <option value="pointsDesc">Highest points</option>
              <option value="pointsAsc">Lowest points</option>
              <option value="dateAsc">Earliest date joined</option>
              <option value="dateDesc">Most recent date joined</option>
            </select>
          </div>
          <div className="col-md-4">
            <select className="form-select mb-3 p-2" onChange={handleFilterChange} value={filter}>
              <option value="" disabled>Filter</option>
              <option value="none">None</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive/Withdrawn</option>
              <option value="graduated">Graduated</option>
            </select>
          </div>
        </div>
        <div>
          {
            students.length ?
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Class</th>
                  <th scope="col">Date joined</th>
                  <th scope="col">Total points</th>
                  <th scope="col">Email</th>
                  <th scope="col">Stream</th>
                  <th scope="col">Status</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => (
                  <tr key={index}>
                    <td>{student.name}</td>
                    <td>{student.class}</td>
                    <td>{student.dateJoined}</td>
                    <td>{student.points}</td>
                    <td>{student.email}</td>
                    <td>{student.stream}</td>
                    <td>{student.status}</td>
                    <td><a href="#" className="btn btn-primary" onClick={() => handleDetails(id)}>Details</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
            :
            <div className="d-flex justify-content-center align-items-center text-danger mb-3" style={{height: "700px"}}>No data found</div>
          }
          {students.length ? <nav>
            <ul className="pagination mt-3 d-flex justify-content-end">
              {currentPage > 1 && (
                <li className="page-item">
                  <a className="page-link" onClick={() => setCurrentPage(currentPage - 1)}>Previous</a>
                </li>
              )}
              {[...Array(totalPages)].map((_, index) => (
                <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                  <a className="page-link" onClick={() => setCurrentPage(index + 1)}>{index + 1}</a>
                </li>
              ))}
              {currentPage < totalPages && (
                <li className="page-item">
                  <a className="page-link" onClick={() => setCurrentPage(currentPage + 1)}>Next</a>
                </li>
              )}
            </ul>
          </nav> : <div></div>}
        </div>
      </div>
    </>
  );
}

export default AdminManageStudents;
