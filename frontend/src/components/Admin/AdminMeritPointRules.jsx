import { useState, useEffect } from 'react'
import jsPDF from 'jspdf'
import autoTable from "jspdf-autotable"
import api from '../../api'

function AdminMeritPointRules() {
  const [popup, setPopup] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState(null);
  const [ruleIdToDelete, setRuleIdToDelete] = useState();
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState('');
  const [rules, setRules] = useState([]);
  const [totalRules, setTotalRules] = useState(0);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleDescription, setNewRuleDescription] = useState('');
  const [newRulePoints, setNewRulePoints] = useState();
  const [addRuleDupErr, setAddRuleDupErr] = useState('');
  const [addDuplicateRule, setAddDuplicateRule] = useState(false);
  const [addRuleErr, setAddRuleErr] = useState('');
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [editedRule, setEditedRule] = useState({});
  const [editRuleError, setEditRuleError] = useState('');
  const [importFile, setImportFile] = useState(null);

  useEffect(() => {
    async function fetchData() {
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

  async function handleAddRule() {
    if (!newRuleName.trim() || !newRuleDescription.trim() || newRulePoints === '' || isNaN(newRulePoints)) {
      setAddRuleErr("Please fill out all fields before adding the rule.");
      return;
    }

    try {
      const response = await api.post('/admin/add-rule', {
        ruleName: newRuleName,
        description: newRuleDescription,
        points: newRulePoints,
        addDuplicate: addDuplicateRule,
      });
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

      setNewRuleName('');
      setNewRuleDescription('');
      setNewRulePoints(0);
    }
    catch (err) {
      console.log(err);
      if (err.response.status == 409) {
        setAddRuleDupErr(err.response.data.message);
      }
    }
  }

  async function handleSaveEdit(ruleId) {
    setEditRuleError('');
    try {
      const response = await api.patch('/admin/edit-rule', {
        id: ruleId,
        name: editedRule.name,
        description: editedRule.description,
        points: editedRule.points
      });
      const updatedRule = response.data.rule;

      const formattedRule = {
        id: updatedRule.id,
        name: updatedRule.name,
        description: updatedRule.description,
        points: updatedRule.operation_type === "add"
          ? "+" + updatedRule.points
          : "-" + updatedRule.points,
        operation_type: updatedRule.operation_type,
      };

      setRules(prevRules =>
        prevRules.map(rule => rule.id === ruleId ? formattedRule : rule)
      );

      setEditingRuleId(null);
      setEditedRule({});
    }
    catch (err) {
      console.log(err);
      if (err.response && err.response.data && err.response.data.message) {
        setEditRuleError(err.response.data.message);
      } else {
        setEditRuleError('An unexpected error occurred.');
      }
    }
  }

  async function handleDelete() {
    try {
      await api.delete(`/admin/merit-point/${ruleIdToDelete}`);

      const response = await api.get(`/admin/manage-merit-points?search=${search}`);
      const transformedData = response.data.rules.map(rule => ({
        id: rule.id,
        name: rule.name,
        description: rule.description,
        points: rule.operation_type === "add" ? "+" + rule.points : "-" + rule.points,
        operation_type: rule.operation_type,
      }));
      setRules(transformedData);
      setTotalRules(response.data.totalRules);

      setPopup(false);
      setRuleToDelete(null);
      setRuleIdToDelete(null);
    }
    catch (err) {
      console.log(err);
    }
  }

  async function handleImport() {
    if (!importFile) {
      alert("Please select a file to import.");
      return;
    }

    const formData = new FormData();
    formData.append("file", importFile);

    try {
      await api.post('/admin/import/rules', formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        }
      });

      const response = await api.get(`/admin/manage-merit-points?search=${search}`);
      const transformedData = response.data.rules.map(rule => ({
        id: rule.id,
        name: rule.name,
        description: rule.description,
        points: rule.operation_type == "add" ? "+" + rule.points : "-" + rule.points,
        operation_type: rule.operation_type,
      }));
      setRules(transformedData);
      setTotalRules(response.data.totalRules);

      setImportFile(null);
    } catch (err) {
      console.log(err);
      alert("Failed to import file.");
    }
  }

  function handleExportChange(e) {
    const format = e.target.value;

    if (format === 'excel') {
      window.location.href = "https://127.0.0.1/api/v1/admin/export/rules/excel";
    } else if (format === 'pdf') {
      const doc = new jsPDF();

      const columns = ["ID", "Name", "Description", "Points"];
      const rows = rules.map(rule => [
        rule.id,
        rule.name,
        rule.description,
        rule.operation_type === "deduct"
          ? -Math.abs(rule.points)
          : rule.points
      ]);

      doc.text("Merit Points Rules", 14, 20);

      autoTable(doc, {
        head: [columns],
        body: rows,
        startY: 30,
      });

      doc.save("merit_rules.pdf");
    } else if (format === 'csv') {
      window.location.href = "https://127.0.0.1/api/v1/admin/export/rules/csv";
    }
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
    setRuleIdToDelete(ruleId);
  }

  function handleEditClick(rule) {
    setEditedRule({});
    setEditingRuleId(rule.id);
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
            <div className="col-lg-6 d-flex align-items-center gap-3">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="form-control"
                onChange={(e) => setImportFile(e.target.files[0])}
              />
              <button className="btn btn-primary" onClick={handleImport}>Import</button>
            </div>
            <div className="col-lg-3">
              <select className="form-select mb-3 p-2" onChange={handleExportChange}>
                <option value="" selected disabled>Export</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
                <option value="pdf">PDF</option>
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
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rules.length > 0 ? rules.map((rule, index) => (
                  <tr key={index} className={editingRuleId == rule.id ? 'table-primary' : ''}>
                    <td scope="row">{rule.id}</td>
                    <td>
                      {editingRuleId == rule.id ? (
                        <input
                          className="form-control"
                          type="text"
                          value={editedRule.name ?? rule.name}
                          onChange={(e) => setEditedRule(prev => ({ ...prev, name: e.target.value }))}
                        />
                      ) : (rule.name)}
                    </td>
                    <td>
                      {editingRuleId == rule.id ? (
                        <input
                          className="form-control"
                          type="text"
                          value={editedRule.description ?? rule.description}
                          onChange={(e) => setEditedRule(prev => ({ ...prev, description: e.target.value }))}
                        />
                      ) : (rule.description)}
                    </td>
                    <td>
                      {editingRuleId == rule.id ? (
                        <input
                          className="form-control"
                          type="number"
                          value={editedRule.points ?? rule.points.replace('+', '')}
                          onChange={(e) => setEditedRule(prev => ({ ...prev, points: e.target.value }))}
                        />
                      ) : (rule.points)}
                    </td>
                    <td>
                      {editingRuleId == rule.id ? (
                        <>
                          <button
                            className="btn btn-primary me-5"
                            onClick={() => handleSaveEdit(rule.id)}
                          >Save</button>
                          <button
                            className="btn btn-secondary"
                            onClick={() => {
                              setEditingRuleId(null);
                              setEditedRule({});
                            }}
                          >Cancel</button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn btn-primary me-5"
                            onClick={() => handleEditClick(rule)}
                          >
                            <i className="bi bi-pencil-square"></i> Edit
                          </button>
                          <button className="btn btn-danger" onClick={() => handleDeleteClick(rule.id)}>
                            <i className="bi bi-trash3"></i> Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                )) :
                  <div className="mb-5">
                    <p className="text-danger">No match found</p>
                  </div>
                }
                <tr className="table-secondary">
                  <td>#</td>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={newRuleName}
                      onChange={(e) => setNewRuleName(e.target.value)}
                      placeholder="Rule name"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      name="description"
                      value={newRuleDescription}
                      onChange={(e) => setNewRuleDescription(e.target.value)}
                      placeholder="Description"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control"
                      name="points"
                      value={newRulePoints}
                      onChange={(e) => setNewRulePoints(e.target.value)}
                      placeholder="Points"
                    />
                  </td>
                  <td>
                    <button
                      className="btn btn-success"
                      onClick={handleAddRule}
                    >
                      <i className="bi bi-plus-circle"></i> Add Rule
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <p className="fw-lighter">Total rules: {totalRules}</p>
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
                <button className="btn btn-danger me-3" onClick={() => handleDelete()}>Delete</button>
                <button className="btn btn-secondary" onClick={() => setPopup(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )
      }

      {
        addRuleDupErr && (
          <div className="popup d-flex justify-content-center align-items-center">
            <div className="popup-content p-4 bg-white rounded shadow">
              <h5>Duplicate rules</h5>
              <p>{addRuleDupErr}</p>
              <div className="d-flex justify-content-end">
                <button
                  className="btn btn-primary me-3"
                  onClick={() => {
                    handleAddRule();
                    setAddDuplicateRule(true);
                  }}
                >Add anyway</button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setAddRuleDupErr(false)}
                >Cancel</button>
              </div>
            </div>
          </div>
        )
      }

      {
        addRuleErr && (
          <div className="popup d-flex justify-content-center align-items-center">
            <div className="popup-content p-4 bg-white rounded shadow">
              <h5>Error</h5>
              <p>{addRuleErr}</p>
              <div className="d-flex justify-content-end">
                <button
                  className="btn btn-primary"
                  onClick={() => setAddRuleErr('')}
                >Ok</button>
              </div>
            </div>
          </div>
        )
      }

      {
        editRuleError && (
          <div className="popup d-flex justify-content-center align-items-center">
            <div className="popup-content p-4 bg-white rounded shadow">
              <h5>Error</h5>
              <p>{editRuleError}</p>
              <div className="d-flex justify-content-end">
                <button
                  className="btn btn-primary"
                  onClick={() => setEditRuleError('')}
                >Ok</button>
              </div>
            </div>
          </div>
        )
      }
    </>
  );
}

export default AdminMeritPointRules
