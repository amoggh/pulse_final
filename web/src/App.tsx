import { Link, Outlet, useLocation } from 'react-router-dom'

export default function App() {
  const loc = useLocation()
  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-800">
        <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
          <div className="text-xl font-semibold">PULSE</div>
          <nav className="flex gap-6 text-sm">
            <Link className={linkCls(loc.pathname === '/dashboard')} to="/dashboard">Dashboard</Link>
            <Link className={linkCls(loc.pathname === '/alerts')} to="/alerts">Alerts</Link>
            <Link className={linkCls(loc.pathname === '/resources')} to="/resources">Resources</Link>
            <Link className={linkCls(loc.pathname === '/documents')} to="/documents">Documents</Link>
          </nav>
          <div className="text-xs text-neutral-400">Predict. Unify. Load. Surge. Estimate.</div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}

function linkCls(active: boolean) {
  return `hover:text-white ${active ? 'text-white' : 'text-neutral-400'}`
}


