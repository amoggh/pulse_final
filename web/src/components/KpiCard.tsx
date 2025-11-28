type Props = { title: string; value: string; sub?: string }
export default function KpiCard({ title, value, sub }: Props) {
  return (
    <div className="p-4 rounded-lg border border-neutral-800">
      <div className="text-neutral-400 text-xs">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      {sub && <div className="text-neutral-500 text-xs mt-1">{sub}</div>}
    </div>
  )
}


