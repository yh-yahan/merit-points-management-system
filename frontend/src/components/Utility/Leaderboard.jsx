import { useState } from 'react';

function Leaderboard(){
  const [leaderboard, setLeaderboard] = useState({
    students: [
      {
        id: 2, 
        rank: 1,
        name: 'John Doe',
        points: 253
      },
      {
        id: 1,
        rank: 2, 
        name: 'Jane Smith',
        points: 150
      },
      {
        id: 7,
        rank: 3,
        name: 'Tim',
        points: 110
      },
      {
        id: 4,
        rank: 4,
        name: 'Tom',
        points: 100
      },
      {
        id: 5,
        rank: 5,
        name: 'Anna',
        points: 97
      },
      {
        id: 6,
        rank: 6,
        name: 'Bob',
        points: 95
      },
    ]
  });

  return (
    <div className="container-fluid ms-5 mt-3">
      <h2 className="ms-5 d-flex justify-content-evenly align-items-center">Leaderboard</h2>
      <div className="d-flex justify-content-evenly align-items-center row me-5">
        <button className="btn btn-primary col-4 rounded-0 border-end">All time</button>
        <button className="btn btn-primary col-4 rounded-0 border-end">Weekly</button>
        <button className="btn btn-primary col-4 rounded-0">Monthly</button>
      </div>
      <div className="d-flex justify-content-center align-items-center mt-3">
        <select className="form-select mt-3" style={{ width: "200px" }}>
          <option>All</option>
          <option>Year 7A</option>
          <option>Year 7B</option>
          <option>Year 8</option>
          <option>Year 10A</option>
        </select>
      </div>
      <div className="container">
        <div className="row">
          <div className="col-12 mb-3 d-flex justify-content-between align-items-center border-bottom border-secondary-subtle p-3">
            <p className="fw-bold">Rank</p>
            <p className="fw-bold">Student</p>
            <p className="fw-bold">Points</p>
          </div>
          {leaderboard.students.map((student) => (
            <div key={student.id} className="col-12 mb-3 d-flex justify-content-between align-items-center border-bottom border-secondary-subtle p-3">
              <p>{
                student.rank === 1 ? <p><i class="bi bi-trophy-fill"></i> {student.rank} </p> : 
                student.rank === 2 ? <p><i class="bi bi-star-fill"></i> {student.rank} </p> : 
                student.rank === 3 ? <p><i class="bi bi-star"></i> {student.rank}</p> : student.rank
              }</p>
              <p>{student.name}</p>
              <p>{student.points}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
