import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export default function Documents() {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<any[]>([])

  async function search() {
    const res = await api.get('/documents/search', { params: { hospital_id: 1, query: q } })
    setResults(res.data)
  }

  useEffect(() => {
    search()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Documents</h2>
      <div className="flex gap-2">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search SOPs..." className="flex-1 px-3 py-2 rounded bg-neutral-900 border border-neutral-800" />
        <button onClick={search} className="px-3 py-2 rounded bg-white text-black">Search</button>
      </div>
      <div className="space-y-3">
        {results.map(r => (
          <div key={r.id} className="p-3 rounded border border-neutral-800">
            <div className="font-medium">{r.title}</div>
            <div className="text-sm text-neutral-400">{r.snippet}</div>
          </div>
        ))}
      </div>
    </div>
  )
}


