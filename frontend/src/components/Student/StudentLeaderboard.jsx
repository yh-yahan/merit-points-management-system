import badge1 from '../../assets/1.png';
import badge2 from '../../assets/2.png';
import badge3 from '../../assets/3.png';

function StudentLeaderboard() {
  return (
    <div className="container-fluid ms-5 mt-3">
      <div className="d-flex justify-content-evenly align-items-center row me-5">
        <button 
        className="btn btn-primary col-4 rounded-0 border-end">All time</button>
        <button 
        className="btn btn-primary col-4 rounded-0 border-end">Weekly</button>
        <button 
        className="btn btn-primary col-4 rounded-0">Monthly</button>
      </div>
      <div className="d-flex justify-content-center align-items-center mt-3">
        <select className="form-select mt-3" style={{ width: "200px" }}>
          <option value="all">All</option>
          <option value="myClass">My class</option>
        </select>
      </div>
      <div className="container mt-3">
        <div className="row d-flex">
          <div className="col-12 d-flex align-items-center py-4 px-3">
            <div className="me-2" style={{ width: '50px' }}>
              <img className="img-fluid" src={badge1} />
            </div>
            <div className="flex-grow-1">
              <span>studentName</span>
              <div className="text-secondary small"><span>Year 7A</span></div>
            </div>
            <div className="me-3"><span>321 P</span></div>
          </div>
          <div className="col-12 d-flex align-items-center py-4 px-3">
            <div className="me-2" style={{ width: '50px' }}>
              <img className="img-fluid" src={badge2} />
            </div>
            <div className="flex-grow-1">
              <span>studentName</span>
              <div className="text-secondary small"><span>Year 7B</span></div>
            </div>
            <div className="me-3"><span>315 P</span></div>
          </div>
          <div className="col-12 d-flex align-items-center py-4 px-3">
            <div className="me-2" style={{ width: '50px' }}>
              <img className="img-fluid" src={badge3} />
            </div>
            <div className="flex-grow-1">
              <span>studentName</span>
              <div className="text-secondary small"><span>Year 8</span></div>
            </div>
            <div className="me-3"><span>312 P</span></div>
          </div>
          <div className="col-12 d-flex align-items-center py-4 px-3">
            <div className="ms-3" style={{ width: '40px' }}>
              <span>4</span>
            </div>
            <div className="flex-grow-1">
              <span>studentName</span>
              <div className="text-secondary small"><span>Year 7A</span></div>
            </div>
            <div className="me-3"><span>312 P</span></div>
          </div>
          <div className="col-12 d-flex align-items-center py-4 px-3" 
          style={{backgroundColor: "#e8e8e8"}}>
            <div className="ms-3" style={{ width: '40px' }}>
              <span>5</span>
            </div>
            <div className="flex-grow-1">
              <span>studentName</span>
              <div className="text-secondary small"><span>Year 9A</span></div>
            </div>
            <div className="me-3"><span>210 P</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentLeaderboard;
