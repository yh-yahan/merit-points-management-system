import { useState, useEffect, useRef } from 'react'
import '../css/AdminEditMeritPoints.css'

function AdminEditMeritPoints() {
  const [search, setSearch] = useState("");
  const [displayStudent, setDisplayStudent] = useState(false);
  const [student, setStudent] = useState(null);
  const [mode, setMode] = useState("");
  const [filteredRules, setFilteredRules] = useState([]);
  const [points, setPoints] = useState("");
  const [selectedRule, setSelectedRule] = useState();
  const [rules, setRules] = useState([
    { id: 1, name: 'Fighting', points: "-10", description: 'Fighting' },
    { id: 2, name: 'Scored A*', points: "+5", description: 'Scored A* during exam' },
    { id: 3, name: "Didn't finish assignment", points: "-2", description: "Didn't finish assignment despite the first warning" },
    { id: 4, name: 'Swearing', points: "-5", description: 'Using bad words' }, 
    { id: 5, name: 'Late', points: "-1", description: 'Late to school (after 8:00am)' }, 
    { id: 6, name: 'Become student association president', points: "+10", description: 'Elected as president in student association' }
  ]);
  const [students, setStudents] = useState([
    { id: '1', name: 'John Doe', class: 'Year10B', totalPoints: 85 },
    { id: '2', name: 'Jane Smith', class: 'Year8A', totalPoints: 92 },
    { id: '3', name: 'Jonathon Doe', class: 'Year8A', totalPoints: 88 },
  ]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const listRef = useRef(null);

  useEffect(() => {
    if(search){
      setFilteredStudents(
        students.filter(student =>
          student.name.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
    else{
      setFilteredStudents([]);
    }
  }, [search, students]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (filteredStudents.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prevIndex => (prevIndex + 1) % filteredStudents.length);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prevIndex => (prevIndex - 1 + filteredStudents.length) % filteredStudents.length);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (selectedIndex >= 0) {
            handleStudentClick(filteredStudents[selectedIndex]);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredStudents, selectedIndex]);

  useEffect(() => {
    if(mode == "add"){
      setFilteredRules(rules.filter((rule) => 
        rule.points.includes("+")
      ));
    }
    else if(mode == "deduct"){
      setFilteredRules(rules.filter((rule) => 
        rule.points.includes("-")
      ));
    }
    else{
      setFilteredRules([]);
    }
  }, [mode]);

  useEffect(() => {
    if(selectedRule){
      const rule = rules.find(rule => rule.name === selectedRule);
      if(rule){
        setPoints(rule.points.replace('+', ''));
      }
    }
    else{
      setPoints("");
    }
  }, [selectedRule]);

  function handleStudentClick(student){
    // console.log("Selected student:", student);
    setStudent(student);
    setDisplayStudent(true);
    setSearch('');
    setFilteredStudents([]);
    setSelectedIndex(-1); // Reset selected index
  };

  return (
    <div className="container-fluid ms-3" style={{height: "900px"}}>
      <h1>Edit student merit points</h1>
      <div className="row">
        <div className="col-lg-6 position-relative">
          <input
            type="text"
            placeholder="Search student name"
            className="form-control"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSelectedIndex(-1)} // Reset selection when focusing
          />
          {search && filteredStudents.length > 0 && (
            <ul
              className="list-group position-absolute mt-1 bg-white rounded-top shadow"
              ref={listRef}
            >
              {filteredStudents.map((student, index) => (
                <li
                  key={student.id}
                  className={`list-group-item list-group-item-action ${selectedIndex === index ? 'selected' : ''}`}
                  onClick={() => handleStudentClick(student)}
                >
                  {student.name} - {student.class}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
        {
          displayStudent && <div className="mt-4 ms-3">
            <h3>Student information</h3>
            <p>
              Student name: {student.name}
            </p>
            <p>
              Student class: {student.class}
            </p>
            <p>
              Total points: {student.totalPoints}
            </p>
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
                    {filteredRules.map((rule, index) => 
                      <option value={rule.name} key={index}>{rule.name}</option>
                    )}
                  </select>
                </div>
              </div>
              <div className="mt-3">
                <label>Points to add/deduct</label><br/>
                <input 
                type="number" 
                max="50" 
                value={points} 
                onChange={(e) => setPoints(e.target.value)}
                />
              </div>
              <textarea 
              className="mt-3 border" 
              placeholder="Description... (optional)"
              style={{maxHeight: "400px"}}></textarea>
            </div>
            <button type="button" className="btn btn-danger mt-3">Edit</button>
          </div>
        }
    </div>
  );
}

export default AdminEditMeritPoints;
