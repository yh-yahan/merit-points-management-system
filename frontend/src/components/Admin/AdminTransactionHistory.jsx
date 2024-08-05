import { useState, useEffect } from 'react'

function AdminTransactionHistory(){
  const [historys, setHistorys] = useState([]);

  useEffect(() => {
    const historyData = [
      {
        id: 1, 
        date: "2/3/24", 
        points: "+2", 
        description: "A description...Lorem ipsum dolor sit amet.", 
        pointsAfter: 95, 
        pointsBefore: 93, 
        from: "teacherName", 
        to: "studentName"
      }, 
      {
        id: 2, 
        date: "2/3/24", 
        points: "+2", 
        description: "A description...Lorem ipsum dolor sit amet.", 
        pointsAfter: 95, 
        pointsBefore: 93, 
        from: "teacherName", 
        to: "studentName"
      }, 
      {
        id: 3, 
        date: "2/3/24", 
        points: "+2", 
        description: "A description...Lorem ipsum dolor sit amet.", 
        pointsAfter: 95, 
        pointsBefore: 93, 
        from: "teacherName", 
        to: "studentName"
      }, 
      {
        id: 4, 
        date: "2/3/24", 
        points: "+2", 
        description: "A description...Lorem ipsum dolor sit amet.", 
        pointsAfter: 95, 
        pointsBefore: 93, 
        from: "teacherName", 
        to: "studentName"
      }, 
      {
        id: 5, 
        date: "2/3/24", 
        points: "+2", 
        description: "A description...Lorem ipsum dolor sit amet.", 
        pointsAfter: 95, 
        pointsBefore: 93, 
        from: "teacherName", 
        to: "studentName"
      }, 
      {
        id: 6, 
        date: "2/3/24", 
        points: "+2", 
        description: "A description...Lorem ipsum dolor sit amet.", 
        pointsAfter: 95, 
        pointsBefore: 93, 
        from: "teacherName", 
        to: "studentName"
      }, 
      {
        id: 7, 
        date: "2/3/24", 
        points: "+2", 
        description: "A description...Lorem ipsum dolor sit amet.", 
        pointsAfter: 95, 
        pointsBefore: 93, 
        from: "teacherName", 
        to: "studentName"
      }, 
    ];

    setHistorys(historyData);
  }, []);

  return(
    <>
      <div className="mt-5 ms-5 container-fluid me-4" style={{height: "700px"}}>
        <div>
          <h3 classname="mt-5">Merit points transaction history</h3>
          <div className="row">
            <div className="col-md-6">
              <input type="text" className="form-control" placeholder="Search..." />
            </div>
            <div className="col-md-6">
              <select className="form-select mb-3 p-2">
                <option value="" selected disabled>Sort by</option>
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>
          <div>
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Date</th>
                  <th scope="col">Points</th>
                  <th scope="col">Description</th>
                  <th scope="col">Total points after</th>
                  <th scope="col">Total points before</th>
                  <th scope="col">From</th>
                  <th scope="col">To</th>
                </tr>
              </thead>
              <tbody>
                {
                  historys.map((history, index) => (
                    <tr>
                      <td scope="row">{history.id}</td>
                      <td>{history.date}</td>
                      <td>{history.points}</td>
                      <td>{history.description}</td>
                      <td>{history.pointsAfter}</td>
                      <td>{history.pointsBefore}</td>
                      <td><a href="#">{history.from}</a></td>
                      <td><a href="#">{history.to}</a></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
          <nav>
          <ul className="pagination mt-3 d-flex justify-content-end">
            <li className="page-item">
              <a className="page-link" href="#">Previous</a>
            </li>
            <li className="page-item">
              <a className="page-link" href="#">1</a>
            </li>
            <li className="page-item">
              <a className="page-link" href="#">2</a>
            </li>
            <li className="page-item">
              <a className="page-link" href="#">3</a>
            </li>
            <li className="page-item">
              <a className="page-link" href="#">4</a>
            </li>
            <li className="page-item">
              <a className="page-link" href="#">5</a>
            </li>
            <li className="page-item">
              <a className="page-link" href="#">...</a>
            </li>
            <li className="page-item">
              <a className="page-link" href="#">20</a>
            </li>
            <li className="page-item">
              <a className="page-link" href="#">Next</a>
            </li>
          </ul>
        </nav>
        </div>
      </div>
    </>
  );
}

export default AdminTransactionHistory