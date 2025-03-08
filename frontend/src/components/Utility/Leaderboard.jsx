import { useState, useEffect } from 'react';
import api from '../../api';
import { all } from 'axios';

function Leaderboard(){
  const [allClasses, setAllClasses] = useState([]);
  const [leaderboardType, setLeaderboardType] = useState('alltime');
  const [classFilter, setClassFilter] = useState('all');
  const [leaderboard, setLeaderboard] = useState({
    students: [
      {}
    ]
  });
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchLeaderboard(){
      try{
        const response = await api.get(`/leaderboard?leaderboard=${leaderboardType}&classfilter=${classFilter}`);
        const data = response.data;
        setLeaderboard(data);
        setAllClasses(data.allClasses || []);
      }
      catch(err){
        if (err.response.status === 403){
          setLeaderboard({
            students: []
          });
          setError(err.response.data.message);
        }
      }
    }

    fetchLeaderboard();
  }, [leaderboardType, classFilter]);

  return (
    <div className="container-fluid ms-5 mt-3">
      { error && <div className="alert alert-danger me-5 mb-5">{error}</div> }
      { !error && <div> <h2 className="ms-5 d-flex justify-content-evenly align-items-center">Leaderboard</h2>
      <div className="d-flex justify-content-evenly align-items-center row me-5">
        <button 
        className="btn btn-primary col-4 rounded-0 border-end"
        onClick={()=>setLeaderboardType("alltime")}>All time</button>
        <button 
        className="btn btn-primary col-4 rounded-0 border-end" 
        onClick={()=>setLeaderboardType("weekly")}
        >Weekly</button>
        <button 
        className="btn btn-primary col-4 rounded-0" 
        onClick={()=>setLeaderboardType("monthly")}
        >Monthly</button>
      </div>
      <div className="d-flex justify-content-center align-items-center mt-3">
        <select className="form-select mt-3" style={{ width: "200px" }} onChange={(e) => setClassFilter(e.target.value)}>
          <option value="all">All</option>
          { 
            allClasses.map((classItem, i) => (
              <option key={i} value={classItem}>{classItem}</option>
            ))
          }
        </select>
      </div>
      <div className="container mt-3">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Student</th>
              <th>Class</th>
              <th>Points</th>
            </tr>
          </thead>
          { leaderboard.students.length === 0 && <tbody>
              <tr>
                <td colSpan="4" className="text-danger">No data available</td>
              </tr> 
            </tbody> 
          }
          <tbody>
            {leaderboard.students.map((student) => (
              <tr 
                key={student.id} 
                // style={{ backgroundColor: student.rank <= 3 ? "#edcc24" : "white" }}
              >
                <td>
                  {student.rank === 1 ? <i className="bi bi-trophy-fill"></i> : 
                   student.rank === 2 ? <i className="bi bi-star-fill"></i> : 
                   student.rank === 3 ? <i className="bi bi-star"></i> : null}
                  {student.rank}
                </td>
                <td>{student.name_or_username}</td>
                <td>{student.class}</td>
                <td>{student.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> </div> }
    </div>
  );
}

export default Leaderboard;
