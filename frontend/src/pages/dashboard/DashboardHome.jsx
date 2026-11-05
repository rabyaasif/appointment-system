import { useAuth } from '../../hooks/useAuth'
import Overview from './Overview'
import ManageOverview from './ManageOverview'

// Patient ko apna Overview, doctor aur admin ko stats wala Overview
function DashboardHome() {
  const { user } = useAuth()

  return user.role === 'patient' ? <Overview /> : <ManageOverview />
}

export default DashboardHome