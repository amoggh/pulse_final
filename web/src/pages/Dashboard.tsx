import { useEffect, useState } from 'react'
import KpiCard from '../components/KpiCard'
import ForecastChart from '../components/ForecastChart'
import AlertList from '../components/AlertList'
import PulseAI from '../components/PulseAI'
import { api, loadAuthFromStorage } from '../lib/api'

type Forecast = { department_id: number; horizon_date: string; inflow_pred: number; inflow_ci_low: number; inflow_ci_high: number }

export default function Dashboard() {
  const [forecasts, setForecasts] = useState<Forecast[]>([])
  const [load, setLoad] = useState<any>({})

  async function loadData() {
    loadAuthFromStorage()
    const hid = 1
    const res = await api.get(`/dashboard/${hid}`)
    setForecasts(res.data.forecasts)
    setLoad(res.data.load)
  }

  useEffect(() => {
    loadData()
  }, [])

  const er = forecasts.filter(f => f.department_id === 1)
  const chart = er.map(f => ({
    date: new Date(f.horizon_date).toLocaleDateString(),
    pred: Math.round(f.inflow_pred),
    lo: Math.round(f.inflow_ci_low),
    hi: Math.round(f.inflow_ci_high)
  }))

  const bedUtil = load.beds_total ? Math.round((load.beds_occupied / load.beds_total) * 100) : 0

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard title="Bed Utilization" value={`${bedUtil}%`} sub={`${load.beds_occupied || 0}/${load.beds_total || 0}`} />
        <KpiCard title="ICU Occupancy" value={`${load.icu_occupied || 0}/${load.icu_total || 0}`} />
        <KpiCard title="Staff on Shift" value={`${load.staff_on_shift || 0}`} />
        <KpiCard title="Next ER Pred" value={`${chart[0]?.pred ?? '-'}`} sub="Tomorrow" />
      </div>

      {/* ER Forecast */}
      <div className="space-y-2">
        <div className="text-sm text-neutral-400">ER Forecast (7 days)</div>
        <ForecastChart data={chart} />
      </div>

      {/* Live Alerts */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-400">Live Alerts</div>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </div>
        <AlertList />
      </div>
    </div>
  )
}




