import { useState, useEffect } from 'react'
import api from '../../api'

function AdminMeritPointRules() {
  const [popup, setPopup] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState(null);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState('');
  const [rules, setRules] = useState([]);
  const [totalRules, setTotalRules] = useState(0);
  const [initialPoints, setInitialPoints] = useState('');
  const [hasUserChanged, setHasUserChanged] = useState(false);
  const [pointThreshold, setPointThreshold] = useState({});

  useEffect(() => {
    async function fetchData(){
      const response = await api.get(`/admin/manage-merit-points?search=${search}`);
      const data = response.data;
      const transformedData = response.data.rules.map(rule => ({
        id: rule.id, 
        name: rule.name, 
        description: rule.description, 
        points: rule.operation_type == "add" ? "+" + rule.points : "-" + rule.points, 
        operation_type: rule.operation_type, 
      }));
      setTotalRules(data.totalRules);
      setRules(transformedData);
    }
    fetchData();
  }, [search]);

  useEffect(() => {
    if (hasUserChanged && initialPoints !== '') {
      async function updateInitial() {
        try {
          await api.post('admin/initial', {
            initial: initialPoints,
          });
        } catch (err) {
          console.log(err);
        }
      }
      updateInitial();
    }
  }, [initialPoints, hasUserChanged]);

  useEffect(() => {
    async function fetchInitial(){
      try{
        const response = await api.get('admin/initial');
        const initial = response.data;
        setInitialPoints(initial.toString());
      }
      catch(err){
        console.log(err);
      }
    }

    async function fetchPointThreshold(){
      try{
        const response = await api.get('admin/point-threshold');
        setPointThreshold(response.data);
      }
      catch(err){
        console.log(err);
      }
    }

    fetchInitial();
    fetchPointThreshold();
  }, []);

  function handleInitialPointsChange(e) {
    const value = e.target.value;
    setInitialPoints(value);
    setHasUserChanged(true);
  }

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

  function handleDeleteClick(ruleId) {
    const rule = rules.find(rule => rule.id === ruleId);
    setRuleToDelete(rule);
    setPopup(true);
  }

  return (
    <>
      <div className="ms-5 container-fluid">
        <h1 className="mb-5">Manage merit points rules</h1>
        <div>
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
          <div className="row mb-3">
            <div className="col-lg-3">
              <select className="form-select mb-3 p-2">
                <option value="" selected disabled>Import</option>
                <option>Excel</option>
              </select>
            </div>
            <div className="col-lg-3">
              <select className="form-select mb-3 p-2">
                <option value="" selected disabled>Export</option>
                <option>Excel</option>
                <option>CSV</option>
                <option>PDF</option>
              </select>
            </div>
          </div>
          <div>
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Rule name</th>
                  <th scope="col">Description</th>
                  <th scope="col">Points</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.length > 0 ? rules.map((rule, index) => (
                  <tr key={index}>
                    <td scope="row">{rule.id}</td>
                    <td>{rule.name}</td>
                    <td>{rule.description}</td>
                    <td>{rule.points}</td>
                    <td>
                      <button className="btn btn-primary me-5">
                        <i className="bi bi-pencil-square"></i> Edit
                      </button>
                      <button className="btn btn-danger" onClick={() => handleDeleteClick(rule.id)}>
                        <i className="bi bi-trash3"></i> Delete
                      </button>
                    </td>
                  </tr>
                )) :
                  <div className="mb-5">
                    <p className="text-danger">No match found</p>
                  </div>
                }
              </tbody>
            </table>
            <p className="fw-lighter">Total rules: {totalRules}</p>
          </div>
          <div>
            <a href="/add_rule" className="btn btn-primary">Add rule</a>
          </div>
          <div>
            <h2 className="mt-5">Advanced</h2>
            <label className="mx-3">Initial points for newly joined students: </label>
            <div className="col-3 mx-3 mt-2">
              <input
                type="number"
                className="form-control"
                onChange={handleInitialPointsChange}
                value={initialPoints || ''}
              />
            </div>
            <div className="mx-3 mt-5">
              <h2 className="mb-4">Point Threshold Actions</h2>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Threshold (points)</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pointThreshold.length > 0 ? pointThreshold.map((threshold, index) => (
                      <tr key={index}>
                        <td scope="row">{threshold.points}</td>
                        <td>{threshold.actions}</td>
                      </tr>
                    )) :
                      <div className="mb-5">
                        <p className="text-danger">Something went wrong.</p>
                      </div>
                    }
                  </tbody>
                </table>
                <button className="btn btn-primary">Add new threshold</button>
            </div>
          </div>
        </div>
      </div>
      {
        popup && (
          <div className="popup d-flex justify-content-center align-items-center">
            <div className="popup-content p-4 bg-white rounded shadow">
              <h5>Confirm deletion</h5>
              <p>Are you sure you want to delete the rule '{ruleToDelete?.name}'?</p>
              <p className="fw-light text-danger">This action will permanently delete the rule and cannot be undone.</p>
              <div className="d-flex justify-content-end">
                <button className="btn btn-danger me-3">Delete</button>
                <button className="btn btn-secondary" onClick={() => setPopup(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )
      }
    </>
  );
}

export default AdminMeritPointRules