import { useState, useEffect } from 'react'

function AdminMeritPointRules(){
  const [popup, setPopup] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState(null);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState('');
  const [rules, setRules] = useState([
    { id: 1, name: 'Fighting', points: "-10", description: 'Fighting' },
    { id: 2, name: 'Scored A*', points: "+5", description: 'Scored A* during exam' },
    { id: 3, name: "Didn't finish assignment", points: "-2", description: "Didn't finish assignment despite the first warning" },
    { id: 4, name: 'Swearing', points: "-5", description: 'Using bad words' }, 
    { id: 5, name: 'Late', points: "-1", description: 'Late to school (after 8:00am)' }, 
    { id: 6, name: 'Become student association president', points: "+10", description: 'Elected as president in student association' }
  ]);
  const [filteredRules, setFilteredRules] = useState(rules);

  useEffect(() => {
    let filteredRules = rules;
    if(search){
      filteredRules = filteredRules.filter(rule => 
        rule.name.toLowerCase().includes(search.toLowerCase()) || rule.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredRules(filteredRules);
  }, [search]);

  function sortRules(order){
    const sortedRules = [...rules].sort((a, b) => {
      if (order === 'asc') return a.points - b.points;
      if (order === 'desc') return b.points - a.points;
      return 0;
    });
    // setRules(sortedRules);
    setFilteredRules(sortedRules);
  }

  function handleSortChange(event){
    const order = event.target.value;
    setSortOrder(order);
    sortRules(order);
  }

  function handleDeleteClick(ruleId){
    const rule = rules.find(rule => rule.id === ruleId);
    setRuleToDelete(rule);
    setPopup(true);
  }

  return(
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
              onChange={(e) => setSearch(e.target.value)}/>
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
                {filteredRules.length > 0 ? filteredRules.map((rule, index) => (
                  <tr key={index}>
                    <td scope="row">{rule.id}</td>
                    <td>{rule.name}</td>
                    <td>{rule.description}</td>
                    <td>{rule.points}</td>
                    <td>
                      <button className="btn btn-primary me-5">
                        <i className="bi bi-pencil-square"></i> Edit
                      </button>
                      <button className="btn btn-danger"  onClick={() => handleDeleteClick(rule.id)}>
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
            <p className="fw-lighter">Total rules: {rules.length}</p>
          </div>
          <div>
            <a href="/add_rule" className="btn btn-danger">Add rule</a>
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