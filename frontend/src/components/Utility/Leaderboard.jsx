import { useState, useEffect } from 'react';
import api from '../../api';
import { all } from 'axios';
import badge1 from '../../assets/1.png';
import badge2 from '../../assets/2.png';
import badge3 from '../../assets/3.png';

function Leaderboard() {
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
    async function fetchLeaderboard() {
      try {
        const response = await api.get(`/leaderboard?leaderboard=${leaderboardType}&classfilter=${classFilter}`);
        const data = response.data;
        setLeaderboard(data);
        setAllClasses(data.allClasses || []);
      }
      catch (err) {
        if (err.response.status === 403) {
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
      {error && <div className="alert alert-danger me-5 mb-5">{error}</div>}
      {!error && <div> <h2 className="ms-5 d-flex justify-content-evenly align-items-center">Leaderboard</h2>
        <div className="d-flex justify-content-evenly align-items-center row me-5">
          <button
            className="btn btn-primary col-4 rounded-0 border-end"
            onClick={() => setLeaderboardType("alltime")}>All time</button>
          <button
            className="btn btn-primary col-4 rounded-0 border-end"
            onClick={() => setLeaderboardType("weekly")}
          >Weekly</button>
          <button
            className="btn btn-primary col-4 rounded-0"
            onClick={() => setLeaderboardType("monthly")}
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
          <div className="row d-flex">
            {error && <div className="alert alert-danger me-5 mb-5">{error}</div>}
            {leaderboard.students.length === 0 && <p className="text-danger">No data available</p>}
            {
              leaderboard.students.map((student) => (
                <div className="col-12 d-flex align-items-center py-4 px-3">
                  <div className="me-2" style={{ width: '50px' }}>
                    {
                      student.rank == 1 ? <img className="img-fluid" src={badge1} /> :
                        student.rank == 2 ? <img className="img-fluid" src={badge2} /> :
                          student.rank == 3 ? <img className="img-fluid" src={badge3} /> :
                            <div className="ms-3" style={{ width: '40px' }}>
                              <span>{student.rank}</span>
                            </div>
                    }
                  </div>
                  <div className="flex-grow-1">
                    <span>{student.name_or_username}</span>
                    <div className="text-secondary small"><span>{student.class}</span></div>
                  </div>
                  <div className="me-3"><span>{student.points} P</span></div>
                </div>
              ))
            }
          </div>
        </div> </div>}
    </div>
  );
}

export default Leaderboard;
