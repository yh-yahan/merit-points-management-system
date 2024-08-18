import { useState, useEffect } from "react";

function AdminManageStudents() {
  const [sort, setSort] = useState("");
  const [search, setSearch] = useState("");
  const [originalStudents, setOriginalStudents] = useState([
    { name: "studentName", class: "Year10A", dateJoined: "2/3/24", totalPoints: "100", email: "studentEmail@example.com", stream: "Science" },
    { name: "studentName", class: "Year10A", dateJoined: "2/3/24", totalPoints: "170", email: "studentEmail@example.com", stream: "Science" },
    { name: "studentName", class: "Year10A", dateJoined: "7/3/24", totalPoints: "100", email: "studentEmail@example.com", stream: "Science" },
    { name: "studentName", class: "Year10A", dateJoined: "2/3/24", totalPoints: "200", email: "studentEmail@example.com", stream: "Science" },
    { name: "studentName", class: "Year10A", dateJoined: "2/3/24", totalPoints: "100", email: "studentEmail@example.com", stream: "Science" },
    { name: "studentName", class: "Year10A", dateJoined: "3/3/24", totalPoints: "320", email: "studentEmail@example.com", stream: "Science" },
    { name: "studentName", class: "Year10A", dateJoined: "2/3/24", totalPoints: "120", email: "studentEmail@example.com", stream: "Science" },
    { name: "studentName", class: "Year10A", dateJoined: "2/3/24", totalPoints: "100", email: "studentEmail@example.com", stream: "Science" },
    { name: "studentName", class: "Year10A", dateJoined: "2/3/24", totalPoints: "155", email: "studentEmail@example.com", stream: "Science" },
    { name: "studentName", class: "Year10A", dateJoined: "5/5/24", totalPoints: "70", email: "studentEmail@example.com", stream: "Science" },
  ]);

  const [students, setStudents] = useState(originalStudents);

  useEffect(() => {
    let filteredStudents = originalStudents;

    if(search){
      filteredStudents = filteredStudents.filter(student =>
        student.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    switch (sort) {
      case "nameAsc":
        filteredStudents.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "nameDesc":
        filteredStudents.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "pointsAsc":
        filteredStudents.sort((a, b) => a.totalPoints - b.totalPoints);
        break;
      case "pointsDesc":
        filteredStudents.sort((a, b) => b.totalPoints - a.totalPoints);
        break;
      case "dateAsc":
        filteredStudents.sort((a, b) => new Date(a.dateJoined) - new Date(b.dateJoined));
        break;
      case "dateDesc":
        filteredStudents.sort((a, b) => new Date(b.dateJoined) - new Date(a.dateJoined));
        break;
      default:
        break;
    }

    setStudents(filteredStudents);
  }, [search, sort, originalStudents]);

  function handleSortChange(event) {
    setSort(event.target.value);
  }

  function handleSearchChange(event) {
    setSearch(event.target.value);
  }

  return (
    <>
      <div className="me-4 container-fluid mt-5 ms-3">
        <h1 className="mb-4">Manage students</h1>
        <div className="row gx-4">
          <div className="col-sm-3">
            <div className="card shadow-sm p-3 mb-5 bg-white rounded">
              <p className="fw-lighter fs-6">Total students</p>
              <p>{originalStudents.length}</p>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-6">
            <input
              type="text"
              className="form-control"
              placeholder="Search..."
              onChange={handleSearchChange}
            />
          </div>
          <div className="col-md-6">
            <select className="form-select mb-3 p-2" onChange={handleSortChange} value={sort}>
              <option value="" disabled>Sort by</option>
              <option value="nameAsc">Alphabetical order by student name</option>
              <option value="nameDesc">Descending alphabetical order by student name</option>
              <option value="pointsAsc">Highest points</option>
              <option value="pointsDesc">Lowest points</option>
              <option value="dateDesc">Earliest date joined</option>
              <option value="dateAsc">Most recent date joined</option>
            </select>
          </div>
        </div>
        <div>
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Class</th>
                <th scope="col">Date joined</th>
                <th scope="col">Total points</th>
                <th scope="col">Email</th>
                <th scope="col">Stream</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr
                  key={index}
                  onClick={() => handleRowClick(index)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>{student.name}</td>
                  <td>{student.class}</td>
                  <td>{student.dateJoined}</td>
                  <td>{student.totalPoints}</td>
                  <td>{student.email}</td>
                  <td>{student.stream}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {students.length === 0 && <p className="text-danger d-flex justify-content-center">No match found</p>}
        </div>
      </div>
    </>
  );
}

export default AdminManageStudents;
