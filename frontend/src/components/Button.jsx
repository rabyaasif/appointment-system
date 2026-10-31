function Button({ children, isLoading = false, loadingText = 'Please wait...', type = 'submit', ...props }) {
  return (
    <button
      type={type}
      disabled={isLoading}
      className="btn-gradient flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25 hover:shadow-xl hover:shadow-fuchsia-500/35 focus:outline-none focus-visible:ring-4 focus-visible:ring-fuchsia-400/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
      {...props}
    >
      {isLoading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {isLoading ? loadingText : children}
    </button>
  )
}

export default Button