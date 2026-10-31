function AuthLayout({ children, wide = false }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-slate-50 via-brand-50 to-violet-50 px-4 py-4">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-fuchsia-400/15 blur-3xl" />

      <div
        className={`relative w-full ${
          wide ? 'max-w-xl' : 'max-w-md'
        } rounded-3xl border border-white/70 bg-white/90 px-8 py-6 shadow-2xl shadow-brand-600/10 backdrop-blur`}
      >
        {children}
      </div>
    </div>
  )
}

export default AuthLayout