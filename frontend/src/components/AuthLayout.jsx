import { Link } from 'react-router-dom'
import Button from './ui/Button'

// Split card: form on one side, welcome panel on the other.
// Without panelTo only the form card is shown (for pages not converted yet).
function AuthLayout({
  children,
  panelTitle,
  panelText,
  panelLabel,
  panelTo,
  panelSide = 'right',
  wide = false,
}) {
  const hasPanel = Boolean(panelTo)
  const cardWidth = hasPanel ? (wide ? 'max-w-5xl' : 'max-w-4xl') : wide ? 'max-w-xl' : 'max-w-md'

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-100 px-4 py-6">
      <div
        className={`flex w-full overflow-hidden rounded-3xl bg-surface-100 shadow-soft ${cardWidth} ${
          panelSide === 'left' ? 'flex-row-reverse' : ''
        }`}
      >
        <div className="flex flex-1 items-center justify-center px-8 py-10 sm:px-12">
          <div className={`w-full ${wide ? 'max-w-lg' : 'max-w-sm'}`}>{children}</div>
        </div>

        {hasPanel && (
          <aside className="gradient-primary relative hidden w-5/12 shrink-0 flex-col items-center justify-center overflow-hidden px-10 py-10 text-center text-white md:flex">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-20 -left-12 h-48 w-48 rounded-full bg-white/10" />

            <h2 className="relative text-3xl font-extrabold leading-tight">{panelTitle}</h2>
            <p className="relative mt-3 text-sm text-white/80">{panelText}</p>
            <Button as={Link} to={panelTo} variant="on-dark" className="relative mt-8 uppercase tracking-wider">
              {panelLabel}
            </Button>
          </aside>
        )}
      </div>
    </div>
  )
}

export default AuthLayout