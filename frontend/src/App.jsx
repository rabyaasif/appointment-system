import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import VerifyOtp from './pages/VerifyOtp'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'
import DashboardLayout from './components/DashboardLayout'
import DashboardHome from './pages/dashboard/DashboardHome'
import Services from './pages/dashboard/Services'
import BookAppointment from './pages/dashboard/BookAppointment'
import MyAppointments from './pages/dashboard/MyAppointments'
import ManageAppointments from './pages/dashboard/ManageAppointments'
import ManageServices from './pages/dashboard/ManageServices'
import ManageDoctors from './pages/dashboard/ManageDoctors'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />

          <Route element={<RoleRoute roles={['patient']} />}>
            <Route path="services" element={<Services />} />
            <Route path="book" element={<BookAppointment />} />
            <Route path="appointments" element={<MyAppointments />} />
          </Route>

          <Route element={<RoleRoute roles={['doctor', 'admin']} />}>
            <Route path="manage-appointments" element={<ManageAppointments />} />
          </Route>

          <Route element={<RoleRoute roles={['admin']} />}>
            <Route path="manage-services" element={<ManageServices />} />
            <Route path="manage-doctors" element={<ManageDoctors />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App