import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts'

type Point = { date: string; pred: number; lo: number; hi: number }

export default function ForecastChart({ data }: { data: Point[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid stroke="#222" />
          <XAxis dataKey="date" stroke="#aaa" />
          <YAxis stroke="#aaa" />
          <Tooltip />
          <Area type="monotone" dataKey="hi" stroke="transparent" fill="rgba(255,255,255,0.06)" />
          <Area type="monotone" dataKey="lo" stroke="transparent" fill="rgba(0,0,0,0.0)" />
          <Line type="monotone" dataKey="pred" stroke="#fff" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}


