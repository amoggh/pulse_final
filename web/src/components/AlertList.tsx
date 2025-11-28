import { useEffect, useState } from 'react'
import { api } from '../lib/api'

type Alert = { id: number; severity: string; title: string; message: string; status: string; ts: string }

export default function AlertList() {
  const [alerts, setAlerts] = useState<Alert[]>([])

  async function load() {
    const res = await api.get('/alerts')
    setAlerts(res.data)
  }

  useEffect(() => {
    load()
    const id = setInterval(load, 5000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="space-y-3">
      {alerts.map(a => (
        <div key={a.id} className="p-3 rounded border border-neutral-800">
          <div className="text-xs text-neutral-400">{new Date(a.ts).toLocaleString()} • {a.severity}</div>
          <div className="font-medium">{a.title}</div>
          <div className="text-sm text-neutral-300">{a.message}</div>
        </div>
      ))}
    </div>
  )
}


