import AdminNavbar from "./components/Admin/AdminNavbar.jsx"
import TeachersNavbar from "./components/Teacher/TeachersNavbar.jsx"
import StudentsNavbar from "./components/Student/StudentsNavbar.jsx"
import { Routes, Route} from "react-router-dom"

function App() {
  return (
    <>
      <AdminNavbar  />
      <TeachersNavbar />
      <StudentsNavbar />
    </>
  )
}

export default App
