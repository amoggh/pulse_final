import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, setAuthToken } from '../lib/api'
import googleIcon from '../assets/google BandW.png'
import facebookIcon from '../assets/face book BandW.png'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const form = new FormData()
      form.append('username', email)
      form.append('password', password)
      const res = await api.post('/auth/login', form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
      setAuthToken(res.data.access_token)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
      <p className="text-base md:text-lg uppercase tracking-[0.4em] text-neutral-400 mb-6">It&apos;s good to see you</p>
      <div className="w-full max-w-4xl rounded-[40px] border border-neutral-800 bg-neutral-900/60 backdrop-blur-xl shadow-[0_0_60px_rgba(255,255,255,0.05)] overflow-hidden pulse-breathing-border">
        <div className="grid md:grid-cols-[1.1fr_1fr]">
          <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-neutral-900 via-black to-neutral-950 border border-neutral-800 pulse-breathing-border rounded-[32px] md:rounded-l-[32px] md:rounded-r-none">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-neutral-400 mb-4">Pulse</p>
              <h2 className="text-4xl font-semibold leading-tight mb-6">Predict, unify and act faster with care intelligence.</h2>
              <p className="text-neutral-400">
                Access real-time surge predictions, see operational bottlenecks, and align every team with the same live picture of
                capacity—all from a single command dashboard.
              </p>
            </div>
            <div className="mt-10 space-y-4 text-sm text-neutral-400">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Operational readiness 24/7
              </div>
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                Always-on predictive alerts
              </div>
            </div>
          </div>
          <div className="p-8 md:p-10 bg-black/40 border border-neutral-800 pulse-breathing-border rounded-[32px] md:rounded-r-[32px] md:rounded-l-none md:-ml-px">
            <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-neutral-800 text-xs uppercase tracking-[0.3em] text-neutral-400 mb-6">
              Login
            </span>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm text-neutral-400">Email</label>
                <input
                  className="w-full px-4 py-3 rounded-2xl bg-neutral-900 border border-neutral-800 focus:outline-none focus:border-white transition"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@gmail.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-neutral-400">Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-2xl bg-neutral-900 border border-neutral-800 focus:outline-none focus:border-white transition"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              {error && <div className="text-red-400 text-sm">{error}</div>}
              <button className="w-full py-3 rounded-2xl bg-white text-black font-semibold hover:bg-neutral-200 transition">Login</button>
              <div className="grid gap-3">
                <button
                  type="button"
                  className="w-full py-3 rounded-2xl border border-neutral-800 bg-neutral-900/40 hover:bg-neutral-900 transition flex items-center justify-center gap-3"
                >
                  <img src={googleIcon} alt="Google logo" className="w-5 h-5 object-contain" />
                  <span>Login with Google</span>
                </button>
                <button
                  type="button"
                  className="w-full py-3 rounded-2xl border border-neutral-800 bg-neutral-900/40 hover:bg-neutral-900 transition flex items-center justify-center gap-3"
                >
                  <img src={facebookIcon} alt="Facebook logo" className="w-5 h-5 object-contain" />
                  <span>Login with Facebook</span>
                </button>
              </div>
            </form>
            <button
              type="button"
              onClick={() => navigate('/signin')}
              className="mt-8 w-full py-3 rounded-2xl border border-dashed border-neutral-800 text-neutral-400 hover:text-white hover:border-white transition text-sm"
            >
              New to Pulse? Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
