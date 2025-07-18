import { Chart } from 'chart.js/auto'
import { Line, Bar } from "react-chartjs-2"
import { useState, useEffect, useRef } from "react"
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import '../css/AdminOverview.css'
import api from "../../api"

function Overview() {
  const [lineChartData, setLineChartData] = useState({ labels: [], datasets: [] });
  const [barChartDataDeducted, setBarChartDataDeducted] = useState({ labels: [], datasets: [] });
  const [barChartDataAwarded, setBarChartDataAwarded] = useState({ labels: [], datasets: [] });
  const [overview, setOverview] = useState({ totalAwarded: 0, totalDeducted: 0, avgPoint: 0, totalStudents: 0 });
  const [error, setError] = useState("");
  const [recentData, setRecentData] = useState({
    titles: [],
    diffInWordsList: [],
    ruleNames: [],
    descriptions: [],
    cardSignatures: [],
    formattedCreatedAt: [],
  });

  const lineChartRef = useRef();
  const barAwardedRef = useRef();
  const barDeductedRef = useRef();

  useEffect(() => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const currentMonthIndex = new Date().getMonth();
    const currentMonths = months.slice(0, currentMonthIndex + 1);

    async function fetchOverviewData() {
      try {
        const get = await api.get('/admin/overview');
        const data = get.data;
        setOverview({
          totalAwarded: data[0].totalAddedPoints,
          totalDeducted: data[0].totalDeductedPoints,
          avgPoint: data[0].avgPointPerStudent,
          totalStudents: data[0].totalStudents,
        });

        setLineChartData({
          labels: currentMonths,
          datasets: [
            {
              label: 'Total merit point awarded',
              data: data[1].totalAwarded,
              borderColor: "rgba(54, 162, 235, 0.5)",
              backgroundColor: "rgba(54, 162, 235, 0.5)",
            },
            {
              label: 'Total merit point deducted',
              data: data[1].totalDeducted,
              borderColor: 'rgba(255, 99, 132, 0.5)',
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
            }
          ]
        });
        const barChartDataAwarded = data.barChartDataAwarded;
        const colorPalette = [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)'
        ];

        // Prepare the datasets for the bar chart
        const datasetsAwarded = Object.entries(barChartDataAwarded).map(([key, value], index) => ({
          label: key.replace(/([A-Z])/g, ' $1').trim(), // Format label for display
          backgroundColor: colorPalette[index % colorPalette.length],
          data: value.slice(0, currentMonthIndex + 1) // Use data for the current months
        }));
        setBarChartDataAwarded({
          labels: currentMonths,
          datasets: datasetsAwarded
        });

        const barChartDataDeducted = data.barChartDataDeducted;
        // Prepare the datasets for the bar chart
        const datasetsDeducted = Object.entries(barChartDataDeducted).map(([key, value], index) => ({
          label: key.replace(/([A-Z])/g, ' $1').trim(), // Format label for display
          backgroundColor: colorPalette[index % colorPalette.length],
          data: value.slice(0, currentMonthIndex + 1) // Use data for the current months
        }));
        setBarChartDataDeducted({
          labels: currentMonths,
          datasets: datasetsDeducted
        });

        const recentActivityData = data.recentActivityData;
        setRecentData({
          titles: recentActivityData.titles,
          diffInWordsList: recentActivityData.diffInWordsList,
          ruleNames: recentActivityData.ruleNames,
          descriptions: recentActivityData.descriptions,
          cardSignatures: recentActivityData.cardSignatures,
          formattedCreatedAt: recentActivityData.formattedCreatedAt,
        });
      }
      catch (err) {
        // console.log(err);
        setError("An error occurred while fetching the data. Please try again later.");
      }
    }
    fetchOverviewData();
  }, []);

  async function exportChartsToPDF() {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const headerHeight = 10;
    const footerHeight = 10;
    const chartSpacing = 10;

    const charts = [
      { ref: lineChartRef, title: "Points Awarded & Deducted" },
      { ref: barAwardedRef, title: "Most Awarded Points" },
      { ref: barDeductedRef, title: "Most Deducted Points" },
    ];

    const currentDate = new Date().toLocaleDateString();

    const chartImages = [];
    for (const chart of charts) {
      if (!chart.ref.current) continue;

      const canvas = await html2canvas(chart.ref.current);
      const imgData = canvas.toDataURL("image/png");
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

      chartImages.push({
        title: chart.title,
        imgData,
        imgWidth,
        imgHeight
      });
    }

    let y = margin + headerHeight;
    let pageNumber = 1;
    const totalPages = [];

    for (let i = 0; i < chartImages.length; i++) {
      const { title, imgData, imgWidth, imgHeight } = chartImages[i];

      addHeader(pdf, pageWidth, margin, currentDate);

      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text(title, margin, y);
      y += 5;

      if (y + imgHeight + footerHeight > pageHeight) {
        pdf.addPage();
        totalPages.push(pageNumber++);
        y = margin + headerHeight;
        addHeader(pdf, pageWidth, margin, currentDate);
        pdf.text(title, margin, y);
        y += 5;
      }

      pdf.addImage(imgData, 'PNG', margin, y, imgWidth, imgHeight);
      y += imgHeight + chartSpacing;

      if (i < chartImages.length - 1) {
        const nextImgHeight = chartImages[i + 1].imgHeight;
        if (y + nextImgHeight + footerHeight > pageHeight) {
          pdf.addPage();
          totalPages.push(pageNumber++);
          y = margin + headerHeight;
        }
      }
    }

    totalPages.push(pageNumber);

    const total = totalPages.length;
    for (let i = 0; i < total; i++) {
      pdf.setPage(i + 1);
      addFooter(pdf, i + 1, total, pageWidth, pageHeight, margin);
    }

    pdf.save("overview-charts.pdf");
  }

  function addHeader(pdf, pageWidth, margin, date) {
    pdf.setFontSize(10);
    pdf.setTextColor(150);
    pdf.text("Merit Points Overview", margin, 10);
    pdf.text(`Date: ${date}`, pageWidth - margin, 10, { align: 'right' });
  }

  function addFooter(pdf, pageNumber, totalPages, pageWidth, pageHeight, margin) {
    pdf.setFontSize(10);
    pdf.setTextColor(150);
    pdf.text(`Page ${pageNumber} of ${totalPages}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
  }

  function handleExportChange(e) {
    const format = e.target.value;

    if (format === 'excel') {
      window.location.href = "https://127.0.0.1/api/v1/admin/export/chart";
    } else if (format === 'pdf') {
      exportChartsToPDF();
    }
  }

  const [showStat, setShowStat] = useState("opt1");

  function handleSelectChange(event) {
    setShowStat(event.target.value);
  }

  return (
    <>
      <div className="mt-4 container-fluid">
        <h1 className="mb-4">Overview</h1>

        {error ? <div className="text-danger mb-3" style={{ height: "700px" }}>{error}</div> :
          <>
            <div className="row gx-4">
              <div className="col-sm-3">
                <div className="card shadow-sm p-3 mb-5 bg-white rounded">
                  <p className="fw-lighter fs-6">Total points awarded this month</p>
                  <p>{overview.totalAwarded}</p>
                </div>
              </div>

              <div className="col-sm-3">
                <div className="card shadow-sm p-3 mb-5 bg-white rounded">
                  <p className="fw-lighter fs-6">Total points deducted this month</p>
                  <p>{overview.totalDeducted}</p>
                </div>
              </div>

              <div className="col-sm-3">
                <div className="card shadow-sm p-3 mb-5 bg-white rounded">
                  <p className="fw-lighter fs-6">Average points per student</p>
                  <p>{overview.avgPoint}</p>
                </div>
              </div>
              <div className="col-sm-3">
                <div className="card shadow-sm p-3 mb-5 bg-white rounded">
                  <p className="fw-lighter fs-6">Total students</p>
                  <p>{overview.totalStudents}</p>
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
                    <select className="form-select mb-3 p-2" onChange={handleExportChange}>
                      <option value="" selected disabled>Export data</option>
                      <option value="excel">Excel</option>
                      <option value="pdf">PDF</option>
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
                  {recentData.titles.map((title, index) => (
                    <div key={index} className="card shadow-sm p-3 mb-2 bg-white rounded">
                      <p className="fw-bold">{title}</p>
                      <p className="fw-lighter fs-6">{recentData.diffInWordsList[index]}</p>
                      <p>Reason: {recentData.ruleNames[index]}</p>
                      <div className="collapse" id={`collapse${index}`}>
                        <div>
                          <p>Description: {recentData.descriptions[index]}</p>
                          <p className="fw-lighter fs-6">{recentData.cardSignatures[index]}</p>
                          <p className="fw-lighter fs-6">{recentData.formattedCreatedAt[index]}</p>
                        </div>
                      </div>
                      <p className="d-inline-flex gap-1">
                        <button
                          className="btn show-detail-btn mt-3"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#collapse${index}`}
                          aria-expanded="false"
                          aria-controls={`collapse${index}`}>
                          Show details
                        </button>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        }
      </div>

      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
        <div ref={lineChartRef} style={{ width: '800px', height: '700px' }}>
          <Line
            data={lineChartData}
            options={{
              responsive: false,
              maintainAspectRatio: false
            }}
            width={800}
            height={400}
          />
        </div>

        <div ref={barAwardedRef} style={{ width: '800px', height: '700px' }}>
          <Bar
            data={barChartDataAwarded}
            options={{
              responsive: false,
              maintainAspectRatio: false
            }}
            width={800}
            height={400}
          />
        </div>

        <div ref={barDeductedRef} style={{ width: '800px', height: '700px' }}>
          <Bar
            data={barChartDataDeducted}
            options={{
              responsive: false,
              maintainAspectRatio: false
            }}
            width={800}
            height={400}
          />
        </div>
      </div>
    </>
  );
}

export default Overview
