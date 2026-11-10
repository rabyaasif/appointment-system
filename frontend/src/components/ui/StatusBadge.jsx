import Badge from './Badge'
import { capitalize } from '../../utils/format'

// Appointment status se badge ka rang (DESIGN_SYSTEM.md, section 2.2)
const statusVariant = {
  pending: 'warning',
  confirmed: 'success',
  completed: 'info',
  cancelled: 'danger',
}

function StatusBadge({ status, className = '' }) {
  return (
    <Badge variant={statusVariant[status] ?? 'primary'} dot className={className}>
      {capitalize(status)}
    </Badge>
  )
}

export default StatusBadge