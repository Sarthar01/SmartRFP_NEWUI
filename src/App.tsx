import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import Dashboard from './pages/Dashboard'
import Sidebar from './components/sidebar'
import Proposal from './pages/Proposal'
import Response from './pages/Response'
import Signup from './pages/signup'
import AdminDashboard from './pages/AdminDashboard'
import TemplatesPage from './pages/TemplatesPage'



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/super-admin-dashboard" element={<SuperAdminDashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sidebar" element={<Sidebar />} />
        <Route path="/proposal" element={<Proposal />} />
        <Route path="/response/:rfpId" element={<Response />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin-panel" element={<AdminDashboard />} />
        <Route path="/template" element={<TemplatesPage />} />
        
        
      </Routes>
    </Router>
  )
}

export default App