function PagePlaceholder({ title }) {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{title}</h1>
      <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
        This page is coming soon.
      </div>
    </div>
  )
}

export default PagePlaceholder