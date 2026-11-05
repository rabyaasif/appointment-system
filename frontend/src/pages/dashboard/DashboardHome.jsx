import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Overview from './Overview'

// Patient ko apna Overview, doctor aur admin ko Appointments page
function DashboardHome() {
  const { user } = useAuth()

  if (user.role === 'patient') return <Overview />
  return <Navigate to="/dashboard/manage-appointments" replace />
}

export default DashboardHome