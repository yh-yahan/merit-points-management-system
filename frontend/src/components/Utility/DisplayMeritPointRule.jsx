import { useState, useEffect } from "react";
import api from "../../api";

function DisplayMeritPointRule({ user }) {
  const [rules, setRules] = useState([]);
  const [search, setSearch] = useState("");
  const [totalRules, setTotalRules] = useState();
  const [sortOrder, setSortOrder] = useState('');

  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchMeritPointRule() {
      try {
        const response = await api.get(`${user}/merit-point/rules?search=${search}`);
        const data = response.data;
        const transformedData = data.rules.map(rule => ({
          id: rule.id,
          name: rule.name,
          description: rule.description,
          points: rule.operation_type == "add" ? "+" + rule.points : "-" + rule.points,
          operation_type: rule.operation_type,
        }));
        setTotalRules(data.totalRules);
        setRules(transformedData);

        setError("");
      } catch (err) {
        setError("Unable to fetch merit point rules.");
      }
    }

    fetchMeritPointRule();
  }, [search]);

  function sortRules(order) {
    const sortedRules = [...rules].sort((a, b) => {
      if (order === 'asc') return a.points - b.points;
      if (order === 'desc') return b.points - a.points;
      return 0;
    });
    setRules(sortedRules);
  }

  function handleSortChange(event) {
    const order = event.target.value;
    setSortOrder(order);
    sortRules(order);
  }

  return (
    <div className="container-fluid min-vh-100">
      {error && <div className="alert alert-danger">{error}</div>}
      {!error && <>
        <div className="row mb-3">
          <div className="col-lg-6">
            <input
              type="text"
              className="form-control"
              placeholder="Search..."
              onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="col-lg-6">
            <select className="form-select mb-3 p-2" onChange={handleSortChange} value={sortOrder}>
              <option value="" disabled>Display order</option>
              <option value="asc">Points ascending</option>
              <option value="desc">Points descending</option>
            </select>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Rule name</th>
                <th scope="col">Description</th>
                <th scope="col">Points</th>
              </tr>
            </thead>
            <tbody>
              {rules.map(rule => (
                <tr>
                  <td>{rule.id}</td>
                  <td>{rule.name}</td>
                  <td>{rule.description}</td>
                  <td>{rule.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="fw-lighter">Total rules: {totalRules}</p>
      </>}
    </div>
  );
}

export default DisplayMeritPointRule;
