import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import VerifyOtp from './pages/VerifyOtp'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './components/DashboardLayout'
import Overview from './pages/dashboard/Overview'
import Services from './pages/dashboard/Services'
import BookAppointment from './pages/dashboard/BookAppointment'
import MyAppointments from './pages/dashboard/MyAppointments'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Overview />} />
          <Route path="services" element={<Services />} />
          <Route path="book" element={<BookAppointment />} />
          <Route path="appointments" element={<MyAppointments />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App