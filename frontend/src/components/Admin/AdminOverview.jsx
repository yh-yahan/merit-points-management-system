import { Chart } from "chart.js/auto"
import { Line, Bar, Pie } from "react-chartjs-2"
import { useState, useEffect } from "react"
import '../css/AdminOverview.css'

function Overview(){
  const [lineChartData, setLineChartData] = useState({labels: [], datasets: []});
  const [barChartDataDeducted, setBarChartDataDeducted] = useState({labels: [], datasets: []});
  const [barChartDataAwarded, setBarChartDataAwarded] = useState({labels: [], datasets: []});

  useEffect(() => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const currentMonthIndex = new Date().getMonth();
    const currentMonths = months.slice(0, currentMonthIndex + 1);

    setLineChartData({
      labels: currentMonths,
      datasets: [
        {
          label: 'Total merit point awarded',
          data: [60, 50, 53, 62, 42, 40, 35, 64, null, null, null, null].slice(0, currentMonthIndex + 1),
          borderColor: "rgba(54, 162, 235, 0.5)",
          backgroundColor: "rgba(54, 162, 235, 0.5)",
        },
        {
          label: 'Total merit point deducted',
          data: [50, 43, 63, 21, 30, 20, 42, 23, null, null, null, null].slice(0, currentMonthIndex + 1),
          borderColor: 'rgba(255, 99, 132, 0.5)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        }
      ]
    });

    setBarChartDataAwarded({
      labels: currentMonths,
      datasets: [
        {
          label: 'Scored A* in exam',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          data: [10, 10, 0, 0, 0, 20].slice(0, currentMonthIndex + 1)
        },
        {
          label: 'Scored A in exam',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          data: [15, 7, 9, 6, 10, 5].slice(0, currentMonthIndex + 1)
        },
        {
          label: 'Participation in events',
          backgroundColor: 'rgba(255, 206, 86, 0.5)',
          data: [5, 3, 6, 2, 8, 3].slice(0, currentMonthIndex + 1)
        }, 
        {
          label: 'Full attendance',
          backgroundColor: 'rgba(0, 204, 102, 0.5)',
          data: [3, 5, 6, 2, 9, 4].slice(0, currentMonthIndex + 1)
        }
      ]
    });

    setBarChartDataDeducted({
      labels: currentMonths,
      datasets: [
        {
          label: 'Fighting',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          data: [10, 10, 0, 0, 0, 20].slice(0, currentMonthIndex + 1)
        },
        {
          label: 'Late',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          data: [15, 7, 9, 6, 10, 5].slice(0, currentMonthIndex + 1)
        },
        {
          label: 'Swearing',
          backgroundColor: 'rgba(255, 206, 86, 0.5)',
          data: [5, 3, 6, 2, 8, 3].slice(0, currentMonthIndex + 1)
        }, 
        {
          label: 'Not finishing assignment',
          backgroundColor: 'rgba(0, 204, 102, 0.5)',
          data: [3, 5, 6, 2, 9, 4].slice(0, currentMonthIndex + 1)
        }
      ]
    });
  }, []);

  const [showStat, setShowStat] = useState("opt1");

  function handleSelectChange(event){
    setShowStat(event.target.value);
  };

  return (
    <>
    <div className="mt-5 ms-3 container-fluid">
      <h1 className="mb-4">Overview</h1>

      <div className="row gx-4">
        <div className="col-sm-3">
          <div className="card shadow-sm p-3 mb-5 bg-white rounded">
            <p className="fw-lighter fs-6">Total points awarded this month</p>
            <p>67</p>
          </div>
        </div>

        <div className="col-sm-3">
          <div className="card shadow-sm p-3 mb-5 bg-white rounded">
            <p className="fw-lighter fs-6">Total points deducted this month</p>
            <p>72</p>
          </div>
        </div>

        <div className="col-sm-3">
          <div className="card shadow-sm p-3 mb-5 bg-white rounded">
            <p className="fw-lighter fs-6">Average points per student</p>
            <p>120</p>
          </div>
        </div>
        <div className="col-sm-3">
          <div className="card shadow-sm p-3 mb-5 bg-white rounded">
            <p className="fw-lighter fs-6">Total students</p>
            <p>57</p>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-md-10 mb-5">
          <h3>Statistics</h3>
          <div className="row">
            <div className="col-lg-10">
              <select className="form-select mb-3 p-2" onChange={handleSelectChange}>
                <option value="opt1" selected>Total merit points awarded & deducted by month</option>
                <option value="opt2">Most awarded merit points by category in month</option>
                <option value="opt3">Most deducted merit points by category in month</option>
              </select>
            </div>
            <div className="col-lg-2">
              <select className="form-select mb-3 p-2">
                <option value="" selected disabled>Export data</option>
                <option value="PDF">PDF</option>
                <option value="excel">Excel</option>
              </select>
            </div>
          </div>
          <div className="chart-container">
            {showStat == "opt1" ? <Line
              data={lineChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    beginAtZero: true
                  },
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
            :
            showStat == "opt2" ? <Bar 
            data={barChartDataAwarded}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: {
                  beginAtZero: true
                },
                y: {
                  beginAtZero: true
                }
              }
            }}
            /> : 
            <Bar 
            data={barChartDataDeducted}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: {
                  beginAtZero: true
                },
                y: {
                  beginAtZero: true
                }
              }
            }}
            />
          }
          </div>
        </div>
      </div>
      <div>
        <div>
          <h3>Recent merit points activities</h3>
          <div className="card shadow-sm p-3 mb-2 bg-white rounded">
            <div className="card shadow-sm p-3 mb-2 bg-white rounded">
            <p className="fw-bold">10 points added</p>
            <p className="fw-lighter fs-6">10 min ago</p>
            <p>Reason: Scored A*</p>
            <div className="collapse" id="collapseExample">
              <div>
                <p>Description: Scored 2 A*s in biology and physics during midterm test</p>
                <p className="fw-lighter fs-6">to <a href="#" title="show student detials">StudentName</a> by <a href="#" title="show teacher detials">TeacherName</a></p>
                <p className="fw-lighter fs-6">At 11:30:31 22/7/24 Monday</p>
              </div>
            </div>
            <p className="d-inline-flex gap-1">
              <button 
              className="btn show-detail-btn mt-3" 
              type="button" 
              data-bs-toggle="collapse" 
              data-bs-target="#collapseExample" 
              aria-expanded="false" 
              aria-controls="collapseExample">
                Show details
              </button>
            </p>
          </div>
          <div className="card shadow-sm p-3 mb-2 bg-white rounded">
            <p className="fw-bold">2 points deducted</p>
            <p className="fw-lighter fs-6">12 min ago</p>
            <p>Reason: Swearing/using bad words</p>
            <div className="collapse" id="collapse2">
              <div>
                <p>Description: Swearing when talking to friends during break time</p>
                <p className="fw-lighter fs-6">to <a href="#" title="show student detials">StudentName</a> by <a href="#" title="show teacher detials">TeacherName</a></p>
                <p className="fw-lighter fs-6">At 11:30:31 22/7/24 Monday</p>
              </div>
            </div>
              <p className="d-inline-flex gap-1">
                <button 
                className="btn show-detail-btn mt-3" 
                type="button" 
                data-bs-toggle="collapse" 
                data-bs-target="#collapse2" 
                aria-expanded="false" 
                aria-controls="collapseExample">
                  Show details
                </button>
              </p>
            </div>
            <div className="card shadow-sm p-3 mb-2 bg-white rounded">
            <p className="fw-bold">10 points deducted</p>
            <p className="fw-lighter fs-6">1 hour ago</p>
            <p>Reason: Fighting</p>
            <div className="collapse" id="collapse3">
              <div>
                <p>Description: points deducted due to fighting</p>
                <p className="fw-lighter fs-6">to <a href="#" title="show student detials">StudentName</a> by <a href="#" title="show teacher detials">TeacherName</a></p>
                <p className="fw-lighter fs-6">At 11:30:31 22/7/24 Monday</p>
              </div>
            </div>
              <p className="d-inline-flex gap-1">
                <button 
                className="btn show-detail-btn mt-3" 
                type="button" 
                data-bs-toggle="collapse" 
                data-bs-target="#collapse3" 
                aria-expanded="false" 
                aria-controls="collapseExample">
                  Show details
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default Overview