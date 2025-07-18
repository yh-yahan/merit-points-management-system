import { useState, useEffect } from 'react'
import api from '../../api'

function AdminTransactionHistory() {
  const [historys, setHistorys] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    async function fetchHistoryData() {
      try {
        const response = await api.get(`/admin/transaction-history?page=${currentPage}&sort=${sortDirection}&search=${searchTerm}`);
        const transformedData = response.data.data.map(transaction => ({
          id: transaction.id,
          date: new Date(transaction.date).toLocaleDateString(),
          points: transaction.operation_type == "add" ? `+${transaction.points}` : `-${transaction.points}`,
          description: transaction.description,
          pointsAfter: transaction.total_points_after,
          pointsBefore: transaction.total_points_before,
          from: transaction.from,
          to: transaction.to,
        }));
        setHistorys(transformedData);
        setTotalPages(response.data.last_page);
      }
      catch (err) {
        console.log(err);
      }
    }
    fetchHistoryData();
  }, [currentPage, sortDirection, searchTerm]);

  function handleSearchChange(event) {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // reset to first page on search
  };
  function handleSortChange(event) {
    setSortDirection(event.target.value);
    setCurrentPage(1);
  };

  return (
    <>
      <div className="mt-5 container-fluid me-4 mb-5" style={{ height: "100vh" }}>
        <div>
          <h3>Merit points transaction history</h3>
          <div className="row mb-3">
            <div className="col-12 col-md-6 mb-2 mb-md-0">
              <input type="text" className="form-control" placeholder="Search..." value={searchTerm} onChange={handleSearchChange} />
            </div>
            <div className="col-12 col-md-6 mb-2 mb-md-0">
              <select className="form-select mb-3 p-2" value={sortDirection} onChange={handleSortChange}>
                <option value="" selected disabled>Sort by</option>
                <option value="desc">Latest</option>
                <option value="asc">Oldest</option>
              </select>
            </div>
          </div>
          <div>
            {historys.length ? (
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead className="">
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Date</th>
                      <th scope="col">Points</th>
                      <th scope="col">Description</th>
                      <th scope="col">From</th>
                      <th scope="col">To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historys.map((history, index) => (
                      <tr key={index}>
                        <td>{history.id}</td>
                        <td>{history.date}</td>
                        <td>{history.points}</td>
                        <td>{history.description}</td>
                        <td>
                          <a href="#">{history.from || "N/A"}</a>
                        </td>
                        <td>
                          <a href="#">{history.to}</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div
                className="d-flex justify-content-center align-items-center text-danger mb-3"
                style={{ height: "700px" }}
              >
                No data found
              </div>
            )}
          </div>
          {historys.length ? <nav>
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

export default AdminTransactionHistory