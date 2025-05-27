
function StudentDashboard() {
  return (
    <div className="mt-5 ms-3 container-fluid">
      <div className="mb-3">
        <h2 className="text-secondary">Good Morning, John</h2>
      </div>
      <div>
        <div className="row gx-4">
          <div className="col-sm-4">
            <div className="card shadow-sm p-3 mb-5 bg-white rounded">
              <p className="fw-lighter fs-6">Total points</p>
              <p>120</p>
            </div>
          </div>
          <div className="col-sm-4">
            <div className="card shadow-sm p-3 mb-5 bg-white rounded">
              <p className="fw-lighter fs-6">Total points awarded this month</p>
              <p>20</p>
            </div>
          </div>
          <div className="col-sm-4">
            <div className="card shadow-sm p-3 mb-5 bg-white rounded">
              <p className="fw-lighter fs-6">Total points deducted this month</p>
              <p>5</p>
            </div>
          </div>
        </div>
        <div>
          <h3>My recent point activities</h3>
          <div className="card shadow-sm p-3 mb-2 bg-white rounded me-4">
            <p className="fw-bold">10 points awarded</p>
            <p className="fw-lighter fs-6">1 week before</p>
            <p>Reason: Score A*</p>
            <div className="collapse" id={`collapse`}>
              <div>
                <p>Description: No description provided</p>
                <p className="fw-lighter fs-6">From TeacherName to StudentName</p>
                <p className="fw-lighter fs-6">09:45:34 15/5/25 Thursday</p>
              </div>
            </div>
            <p className="d-inline-flex gap-1">
              <button
                className="btn show-detail-btn mt-3"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#collapse`}
                aria-expanded="false"
                aria-controls={`collapse`}>
                Show details
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
