import AdminDashboardSidebar from "./AdminDashboardSidebar"

function AdminDashboard(){
  return(
    <>
      <div style={{ display: "flex" }}>
        <AdminDashboardSidebar />
        <div style={{ height: "100vh", flexGrow: 1 }}>
          
        </div>
      </div>
    </>
  );
}

export default AdminDashboard