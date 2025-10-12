import { useState, useEffect, useRef } from 'react'
import '../css/AdminEditMeritPoints.css'
import api from "../../api"

function AdminEditMeritPoints() {
  const [search, setSearch] = useState("");
  const [displayStudent, setDisplayStudent] = useState(false);
  const [student, setStudent] = useState(null);
  const [mode, setMode] = useState("");
  const [points, setPoints] = useState("");
  const [selectedRule, setSelectedRule] = useState();
  const [rules, setRules] = useState([{}]);
  const [students, setStudents] = useState([
    {
      id: 0,
      name: '',
      class: '',
      totalPoints: 0
    },
  ]);
  const [studentTransaction, setStudentTransaction] = useState({
    titles: [],
    diffInWordsList: [],
    ruleNames: [],
    descriptions: [],
    cardSignatures: [],
    formattedCreatedAt: [],
  });
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [groupedStudent, setGroupedStudent] = useState([]);
  const [groupedRules, setGroupedRules] = useState({
    add: [],
    deduct: [],
  });
  const [displayedRules, setDisplayedRules] = useState([]);
  const [description, setDescription] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [updateFail, setUpdateFail] = useState('');
  const [error, setError] = useState("");
  const [searchError, setSearchError] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    async function fetchGroupedStudent() {
      try {
        const response = await api.get("/admin/student-by-class");
        const data = response.data;
        setGroupedStudent(data);

        setError("");
      } catch (err) {
        setError("Unable to fetch student");
      }
    }
    fetchGroupedStudent();
  }, []);

  useEffect(() => {
    if (selectedRule && rules.length > 0) {
      const selectedRuleDetials = rules.find(rule => rule.name === selectedRule);

      if (selectedRuleDetials) {
        setPoints(selectedRuleDetials.operation_type == 'add' ? selectedRuleDetials.points : '-' + selectedRuleDetials.points);
      } else {
        setPoints("");
      }
    }
  }, [selectedRule, mode]);

  useEffect(() => {
    if (mode == 'add') {
      setDisplayedRules(groupedRules.add);
    }
    else {
      setDisplayedRules(groupedRules.deduct);
    }
  }, [mode]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (filteredStudents.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prevIndex => (prevIndex + 1) % filteredStudents.length);
        }
        else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prevIndex => (prevIndex - 1 + filteredStudents.length) % filteredStudents.length);
        }
        else if (e.key === 'Enter') {
          e.preventDefault();
          if (selectedIndex >= 0) {
            handleStudentClick(filteredStudents[selectedIndex].id);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredStudents, selectedIndex]);

  useEffect(() => {
    async function searchStudent() {
      try {
        const response = await api.post("/admin/search-student", {
          'search': search
        });
        const data = response.data;
        data.forEach(student => {
          student.name + " - " + student.class;
        });
        setFilteredStudents(data);

        setSearchError("");
      } catch (err) {
        setSearchError("Unable to search student.");
      }
    }

    searchStudent();
  }, [search]);

  async function fetchStudentDetails(studentId) {
    try {
      const response = await api.post("/admin/student-details", {
        'id': studentId
      });
      const data = response.data;
      const studentInformation = {
        'student': data.student,
        'totalPoints': data.totalPoints
      }
      const transaction = {
        titles: data.recentActivity.titles,
        diffInWordsList: data.recentActivity.diffInWordsList,
        ruleNames: data.recentActivity.ruleNames,
        descriptions: data.recentActivity.descriptions,
        cardSignatures: data.recentActivity.cardSignatures,
        formattedCreatedAt: data.recentActivity.formattedCreatedAt
      };
      setRules(data.meritPointRules);
      function groupByOperationType(rules) {
        return rules.reduce((grouped, rule) => {
          const { operation_type } = rule;
          if (!grouped[operation_type]) {
            grouped[operation_type] = [];
          }
          grouped[operation_type].push(rule);
          return grouped;
        }, {});
      };
      const groupedRules = groupByOperationType(data.meritPointRules);
      setGroupedRules(groupedRules);

      setStudentTransaction(transaction);
      setStudent(studentInformation);

      setError("");
    } catch (err) {
      setError("Unable to get student details.");
    }
  }

  async function updatePoint(e) {
    e.preventDefault();
    const selectedRuleDetails = rules.find(rule => rule.name === selectedRule);
    const pointUpdateInfo = {
      operation: mode,
      points: Math.abs(points),
      description: description || '',
      receiver_id: student.student.id,
      rule_id: selectedRuleDetails.id,
    }
    try {
      const response = await api.patch(`/admin/point/${student.student.id}`, pointUpdateInfo);
      const data = response.data;
      setUpdateSuccess(`Updated successfully. Student's current point: ${data.currentPoint}`);
      setUpdateFail("");
    }
    catch (err) {
      setUpdateFail("Update failed.")
    }
  }

  function handleStudentClick(studentId) {
    fetchStudentDetails(studentId);
    setDisplayStudent(true);
    setMode('');
    setPoints('');
    setRules('');
    setDescription('');
    setUpdateSuccess('');
    setUpdateFail('');
    setSearch('');
    setFilteredStudents([]);
    setSelectedIndex(-1); // Reset selected index
    setIsSidebarVisible(true);
  };

  return (
    <div className="container-fluid ms-3">
      <h1>Edit student merit points</h1>
      <div className="row">
        <div className="col-lg-6 position-relative">
          <input
            type="text"
            placeholder="Search student..."
            className="form-control"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSelectedIndex(-1)} // Reset selection when focusing
          />
          {search && filteredStudents.length > 0 && (
            <>
              {searchError && <p className="text-danger mt-1 rounded-top shadow py-3 px-2">{searchError}</p>}
              {!searchError && (<ul
                className="list-group mt-1 rounded-top shadow"
                ref={listRef}
              >
                {filteredStudents.map((student, index) => (
                  <li
                    key={student.id}
                    className={`list-group-item list-group-item-action ${selectedIndex === index ? 'selected' : ''}`}
                    onClick={() => handleStudentClick(student.id)}
                  >
                    {student.name} - {student.class}
                  </li>
                ))}
              </ul>)}
            </>
          )}
        </div>
        {error && <div className="alert alert-danger mt-5">{error}</div>}
        {!error && displayStudent && student != null && <div className="mt-4 ms-3 col-8">
          <h3>Student information</h3>
          <p>
            Student name: {student.student.name}
          </p>
          <p>
            Student class: {student.student.class}
          </p>
          <p>
            Stream: {student.student.stream}
          </p>
          <p>
            Total points: {student.totalPoints}
          </p>
          <div className="accordion mb-5">
            <div className="accordion-item">
              <h2 className="accordion-header" id="headingOne">
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseZero" aria-expanded="false" aria-controls="collapseZero">
                  Last three updates of student points
                </button>
              </h2>
              <div id="collapseZero" className="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#accordion">
                <div className="card shadow-sm p-3 mb-2 rounded">
                  {studentTransaction.titles.map((title, index) => (
                    <div key={index}>
                      <p className="fw-bold">{title}</p>
                      <p className="fw-lighter fs-6">{studentTransaction.diffInWordsList[index]}</p>
                      <p>Reason: {studentTransaction.ruleNames[index]}</p>
                      <div>
                        <p>{studentTransaction.descriptions[index]}</p>
                        <p className="fw-lighter fs-6">{studentTransaction.cardSignatures[index]}</p>
                        <p className="fw-lighter fs-6">{studentTransaction.formattedCreatedAt[index]}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <h3>Edit merit point</h3>
          <div>
            <div className="row">
              <div className="col-lg-3">
                <select className="form-select" onChange={(e) => setMode(e.target.value)}>
                  <option value="" selected disabled>Add/deduct point</option>
                  <option value="add">Add</option>
                  <option value="deduct">Deduct</option>
                </select>
              </div>
              <div className="col-lg-3">
                <select className="form-select" onChange={(e) => setSelectedRule(e.target.value)}>
                  <option value="" selected disabled>Reason</option>
                  {displayedRules.map((rule, index) =>
                    <option value={rule.name} key={index}>{rule.name}</option>
                  )}
                </select>
              </div>
            </div>
            <div className="mt-3">
              <label>Points to add/deduct</label><br />
              <input
                type="number" 
                value={points}
                onChange={(e) => setPoints(e.target.value)}
              />
            </div>
            <textarea
              className="mt-3 border"
              placeholder="Description... (optional)"
              style={{ maxHeight: "400px" }}
              onChange={(e) => setDescription(e.target.value)}></textarea>
          </div>
          {updateSuccess && <div className="alert alert-success mt-3 mb-2">{updateSuccess}</div>}
          {updateFail && <div className="alert alert-danger mt-3 mb-2">{updateFail}</div>}
          <button
            type="button"
            className="btn mt-3"
            onClick={(e) => updatePoint(e)}
          >Update</button>
        </div>
        }
        {!error && <div className={`${isSidebarVisible ? "col-lg-3 shadow-lg" : null} accordion-container ms-auto`} style={{ right: 0, top: 0, height: '100vh', overflowY: 'auto' }}>
          <h2 className="mt-5 mb-3">Students by class</h2>
          <div className="accordion">
            {Object.keys(groupedStudent).map((className) => (
              <div key={groupedStudent[className].classId} className="accordion-item">
                <h2 className="accordion-header" id={`heading-${groupedStudent[className].classId}`}>
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse-${groupedStudent[className].classId}`}
                    aria-expanded="false"
                    aria-controls={`collapse-${groupedStudent[className].classId}`}
                  >
                    {className}
                  </button>
                </h2>
                <div
                  id={`collapse-${groupedStudent[className].classId}`}
                  className="accordion-collapse collapse"
                  aria-labelledby={`heading-${groupedStudent[className].classId}`}
                  data-bs-parent="#accordion"
                >
                  {groupedStudent[className].students.map((student) => (
                    <div
                      key={student.id}
                      className="text-primary fw-bold cursor-pointer ms-3 my-3"
                      onClick={() => handleStudentClick(student.id)}
                    >
                      {student.name}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>}
      </div>
    </div>
  );
}

export default AdminEditMeritPoints;
