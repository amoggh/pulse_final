import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import googleIcon from '../assets/google BandW.png'
import facebookIcon from '../assets/face book BandW.png'

export default function SignIn() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [hospitalName, setHospitalName] = useState('')
  const [location, setLocation] = useState('')
  const [department, setDepartment] = useState('')
  const [bedCapacity, setBedCapacity] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const navigate = useNavigate()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setMessage('Account created. Redirecting to login...')
      setTimeout(() => navigate('/login'), 1200)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
      <p className="text-base md:text-lg uppercase tracking-[0.4em] text-neutral-400 mb-6">Create your space</p>
      <div className="w-full max-w-4xl rounded-[40px] border border-neutral-800 bg-neutral-900/60 backdrop-blur-xl shadow-[0_0_60px_rgba(255,255,255,0.05)] overflow-hidden pulse-breathing-border">
        <div className="grid md:grid-cols-2">
          <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-neutral-900 via-black to-neutral-950 border border-neutral-800 pulse-breathing-border rounded-[32px] md:rounded-l-[32px] md:rounded-r-none">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-neutral-400 mb-4">Pulse</p>
              <h2 className="text-4xl font-semibold leading-tight mb-6">Join a network that keeps hospitals two steps ahead.</h2>
              <p className="text-neutral-400">
                Sign in to orchestrate resources, align teams, and launch proactive responses from a unified command center.
              </p>
            </div>
            <div className="mt-10 space-y-4 text-sm text-neutral-400">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-fuchsia-400" />
                Predictive surge intelligence
              </div>
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                Unified operations visibility
              </div>
            </div>
          </div>
          <div className="p-8 md:p-10 bg-black/40 border border-neutral-800 pulse-breathing-border rounded-[32px] md:rounded-r-[32px] md:rounded-l-none md:-ml-px">
            <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-neutral-800 text-xs uppercase tracking-[0.3em] text-neutral-400 mb-6">
              Sign in
            </span>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm text-neutral-400">Full name</label>
                <input
                  className="w-full px-4 py-3 rounded-2xl bg-neutral-900 border border-neutral-800 focus:outline-none focus:border-white transition"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Jordan Smith"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-neutral-400">Work email</label>
                <input
                  className="w-full px-4 py-3 rounded-2xl bg-neutral-900 border border-neutral-800 focus:outline-none focus:border-white transition"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@hospital.org"
                  type="email"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-neutral-400">Search your hospital</label>
                <input
                  className="w-full px-4 py-3 rounded-2xl bg-neutral-900 border border-neutral-800 focus:outline-none focus:border-white transition"
                  value={hospitalName}
                  onChange={e => setHospitalName(e.target.value)}
                  placeholder="Start typing to find your facility"
                  required
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm text-neutral-400">Select your location</label>
                  <select
                    className="w-full px-4 py-3 rounded-2xl bg-neutral-900 border border-neutral-800 focus:outline-none focus:border-white transition"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    required
                  >
                    <option value="">Choose region</option>
                    <option value="north">North Division</option>
                    <option value="south">South Division</option>
                    <option value="east">East Division</option>
                    <option value="west">West Division</option>
                    <option value="central">Central Division</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm text-neutral-400">Primary department</label>
                  <select
                    className="w-full px-4 py-3 rounded-2xl bg-neutral-900 border border-neutral-800 focus:outline-none focus:border-white transition"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    required
                  >
                    <option value="">Select department</option>
                    <option value="emergency">Emergency & Trauma</option>
                    <option value="icu">Critical Care / ICU</option>
                    <option value="surgery">Surgery & OR</option>
                    <option value="operations">Hospital Operations</option>
                    <option value="admin">Administration</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-neutral-400">Licensed bed capacity</label>
                <input
                  className="w-full px-4 py-3 rounded-2xl bg-neutral-900 border border-neutral-800 focus:outline-none focus:border-white transition"
                  value={bedCapacity}
                  onChange={e => setBedCapacity(e.target.value)}
                  placeholder="e.g. 250"
                  type="number"
                  min="1"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-neutral-400">Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 rounded-2xl bg-neutral-900 border border-neutral-800 focus:outline-none focus:border-white transition"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  required
                />
              </div>
              {message && <div className="text-emerald-400 text-sm">{message}</div>}
              <button
                className="w-full py-3 rounded-2xl bg-white text-black font-semibold hover:bg-neutral-200 transition disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Creating account…' : 'Create account'}
              </button>
              <div className="grid gap-3">
                <button
                  type="button"
                  className="w-full py-3 rounded-2xl border border-neutral-800 bg-neutral-900/40 hover:bg-neutral-900 transition flex items-center justify-center gap-3"
                >
                  <img src={googleIcon} alt="Google logo" className="w-5 h-5 object-contain" />
                  <span>Sign in with Google</span>
                </button>
                <button
                  type="button"
                  className="w-full py-3 rounded-2xl border border-neutral-800 bg-neutral-900/40 hover:bg-neutral-900 transition flex items-center justify-center gap-3"
                >
                  <img src={facebookIcon} alt="Facebook logo" className="w-5 h-5 object-contain" />
                  <span>Sign in with Facebook</span>
                </button>
              </div>
            </form>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="mt-8 w-full py-3 rounded-2xl border border-dashed border-neutral-800 text-neutral-400 hover:text-white hover:border-white transition text-sm"
            >
              Already on Pulse? Log in
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

