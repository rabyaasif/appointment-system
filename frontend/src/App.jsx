import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import DashboardLayout from './components/DashboardLayout'
import PagePlaceholder from './components/PagePlaceholder'
import Overview from './pages/dashboard/Overview'
import Services from './pages/dashboard/Services'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Overview />} />
        <Route path="services" element={<Services />} />
        <Route path="book" element={<PagePlaceholder title="Book Appointment" />} />
        <Route path="appointments" element={<PagePlaceholder title="My Appointments" />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App