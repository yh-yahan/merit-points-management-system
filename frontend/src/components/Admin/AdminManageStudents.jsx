import { useState, useEffect } from "react";
import api from "../../api";

function AdminManageStudents() {
  const [sort, setSort] = useState("");
  const [filter, setFilter] = useState("none");
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);

  const [bulkEdit, setBulkEdit] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [changeClass, setChangeClass] = useState("");
  const [changeStream, setChangeStream] = useState("");
  const [changeStatus, setChangeStatus] = useState("");

  const [allClasses, setAllClasses] = useState();
  const [allStreams, setAllStreams] = useState();

  const [selectedStudent, setSelectedStudent] = useState();
  const [showDeleteStudentConfirm, setShowDeleteStudentConfirm] = useState(false);

  const [error, setError] = useState("");
  const [deletionError, setDeletionError] = useState("");
  const [academicStructureFetchError, setAcademicStructureFetchError] = useState("");

  async function fetchStudentsData() {
    try {
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
      setError("");
    }
    catch (err) {
      setError("Unable to fetch student data.");
    }
  }

  useEffect(() => {
    fetchStudentsData();
  }, [search, sort, currentPage, filter]);

  useEffect(() => {
    async function fetchAcademicStructure() {
      try {
        const response = await api.get('/admin/academic-structure');
        const { studentClass, studentStream } = response.data;

        setAllClasses(studentClass);
        setAllStreams(studentStream);
        setAcademicStructureFetchError("");
      } catch (err) {
        setAcademicStructureFetchError("Unable to fetch classes and streams.");
      }
    }

    fetchAcademicStructure();
  }, []);

  useEffect(() => {
    setBulkEdit(selectedStudents.length > 0);
  }, [selectedStudents]);

  async function deleteStudent() {
    try {
      await api.delete(`/admin/manage-students/${selectedStudent.id}`);

      fetchStudentsData();

      setSelectedStudent(null);
      setShowDeleteStudentConfirm(false);
      setDeletionError("");
    } catch (err) {
      setDeletionError("Unable to delete student.");
    }
  }

  async function handleStudentEdit() {
    try {
      const payload = {
        student_ids: selectedStudents,
        class: changeClass || null,
        stream: changeStream || null,
        status: changeStatus || null,
      };

      await api.put('/admin/manage-students/bulk-edit', payload);
      setChangeClass('');
      setChangeStream('');
      setChangeStatus('');
      setSelectedStudents([]);
      setBulkEdit(false);

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
      setError("");
    } catch (err) {
      setError("Could not edit selected students.");
    }
  }

  function handleSortChange(event) {
    setSort(event.target.value);
    setCurrentPage(1);
  }

  function handleFilterChange(event) {
    setFilter(event.target.value);
    setCurrentPage(1);
  }

  function handleSearchChange(event) {
    setSearch(event.target.value);
    setCurrentPage(1);
  }

  function handleCheckboxToggle(id) {
    setSelectedStudents(prev =>
      prev.includes(id)
        ? prev.filter(studentId => studentId !== id)
        : [...prev, id]
    );
  }

  function handleSelectAll(e) {
    if (e.target.checked) {
      setSelectedStudents(students.map(student => student.id));
    } else {
      setSelectedStudents([]);
    }
  }

  return (
    <>
      <div className="me-4 container-fluid mt-5 ms-3">
        <h1 className="mb-4">Manage students</h1>
        {error && <div className="alert alert-danger">{error}</div>}
        {!error && <div className="row gx-4">
          <div className="col-sm-3">
            <div className="card shadow-sm p-3 mb-5 rounded">
              <p className="fw-lighter fs-6">Total students</p>
              <p>{totalStudents}</p>
            </div>
          </div>
        </div>}
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
          {bulkEdit && (
            <div className="d-flex justify-content-center flex-wrap gap-3">
              <div className="card shadow-sm p-3 mb-4 bg-light rounded border border-primary">
                <h5 className="text-primary mb-3">Edit selected students</h5>
                <div className="d-flex align-items-center flex-wrap gap-3">
                  {academicStructureFetchError && <div className="alert alert-danger">{academicStructureFetchError}</div>}
                  {!academicStructureFetchError && <><select
                    className="form-select w-auto"
                    value={changeClass}
                    onChange={(e) => setChangeClass(e.target.value)}
                  >
                    <option value="" disabled>Class</option>
                    {allClasses && allClasses.map((studentClass) => (
                      <option key={studentClass.id} value={studentClass.class}>{studentClass.class}</option>
                    ))}
                  </select>

                    <select
                      className="form-select w-auto"
                      value={changeStream}
                      onChange={(e) => setChangeStream(e.target.value)}
                    >
                      <option value="" disabled>Stream</option>
                      {allStreams && allStreams.map((stream) => (
                        <option key={stream.id} value={stream.stream}>{stream.stream}</option>
                      ))}
                    </select>

                    <select
                      className="form-select w-auto"
                      value={changeStatus}
                      onChange={(e) => setChangeStatus(e.target.value)}
                    >
                      <option value="" disabled>Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="graduated">Graduated</option>
                    </select></>}

                  <button
                    className="btn btn-success"
                    disabled={!!academicStructureFetchError}
                    onClick={handleStudentEdit}>
                    Apply Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {
            students.length ?
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">
                        <input
                          type="checkbox"
                          checked={selectedStudents.length === students.length && students.length > 0}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th scope="col">Name</th>
                      <th scope="col">Class</th>
                      <th scope="col">Date joined</th>
                      <th scope="col">Total points</th>
                      <th scope="col">Email</th>
                      <th scope="col">Stream</th>
                      <th scope="col">Status</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => (
                      <tr key={index}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student.id)}
                            onChange={() => handleCheckboxToggle(student.id)}
                          />
                        </td>
                        <td>{student.name}</td>
                        <td>{student.class}</td>
                        <td>{student.dateJoined}</td>
                        <td>{student.points}</td>
                        <td>{student.email}</td>
                        <td>{student.stream}</td>
                        <td>{student.status}</td>
                        <td>
                          <button
                            className="btn btn-danger"
                            onClick={() => {
                              setSelectedStudent(student);
                              setShowDeleteStudentConfirm(true);
                            }}
                          >Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              :
              <div className="d-flex justify-content-center align-items-center text-danger mb-3" style={{ height: "700px" }}>No data found</div>
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

      {
        showDeleteStudentConfirm && (
          <div className="popup d-flex justify-content-center align-items-center">
            <div className="popup-content p-4 rounded shadow">
              <h5>Confirm deletion</h5>
              <p>Are you sure you want to delete the student '{selectedStudent?.name}'?</p>
              <p className="fw-light text-danger">This action will permanently delete the user and cannot be undone.</p>
              <div className="d-flex justify-content-end">
                <button className="btn btn-danger me-3" onClick={deleteStudent}>Delete</button>
                <button className="btn btn-secondary" onClick={() => setShowDeleteStudentConfirm(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )
      }
      {deletionError &&
        <div className="popup d-flex justify-content-center align-items-center">
          <div className="popup-content p-4 rounded shadow">
            <h5>Error</h5>
            <p className="text-danger">{deletionError}</p>
            <div className="d-flex justify-content-end">
              <button className="btn btn-primary" onClick={() => {
                setDeletionError("");
                setShowDeleteStudentConfirm(false);
              }}>Ok</button>
            </div>
          </div>
        </div>
      }
    </>
  );
}

export default AdminManageStudents;
