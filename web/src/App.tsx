import { Link, Outlet, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { fetchWeather, fetchAQI, getWeatherIconUrl, type WeatherData, type AQIData } from './lib/weather'

export default function App() {
  const loc = useLocation()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [aqi, setAqi] = useState<AQIData | null>(null)

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch weather and AQI on mount and every 10 minutes
  useEffect(() => {
    const loadWeatherData = async () => {
      const [weatherData, aqiData] = await Promise.all([
        fetchWeather(),
        fetchAQI()
      ])
      setWeather(weatherData)
      setAqi(aqiData)
    }

    loadWeatherData()
    const interval = setInterval(loadWeatherData, 10 * 60 * 1000) // 10 minutes
    return () => clearInterval(interval)
  }, [])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-800 sticky top-0 z-50 bg-[#050505]/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between p-4 gap-4">
          <div className="text-xl font-semibold">PULSE</div>

          <nav className="hidden md:flex gap-6 text-sm">
            <Link className={linkCls(loc.pathname === '/dashboard')} to="/dashboard">Dashboard</Link>
            <Link className={linkCls(loc.pathname === '/pulse-ai')} to="/pulse-ai">PulseAI</Link>
            <Link className={linkCls(loc.pathname === '/alerts')} to="/alerts">Alerts</Link>
            <Link className={linkCls(loc.pathname === '/resources')} to="/resources">Resources</Link>
            <Link className={linkCls(loc.pathname === '/documents')} to="/documents">Documents</Link>
          </nav>

          {/* Info Bar - Time, Weather, AQI */}
          <div className="flex items-center gap-3 text-xs">
            {/* Time */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 glass-panel rounded-lg">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-mono text-neutral-300">{formatTime(currentTime)}</span>
            </div>

            {/* Weather */}
            {weather && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 glass-panel rounded-lg">
                <img
                  src={getWeatherIconUrl(weather.icon)}
                  alt={weather.condition}
                  className="w-6 h-6"
                />
                <span className="text-neutral-300">{weather.temperature}°C</span>
              </div>
            )}

            {/* AQI */}
            {aqi && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 glass-panel rounded-lg">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: aqi.color }}
                />
                <span className="text-neutral-400">AQI:</span>
                <span className="font-semibold" style={{ color: aqi.color }}>
                  {aqi.level}
                </span>
              </div>
            )}
          </div>

          <div className="text-xs text-neutral-400 hidden xl:block">Predict. Unify. Load. Surge. Estimate.</div>
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
