export default function ScoreBar({ value, max = 100, label, color = "bg-emerald-500" }) {
  const pct = Math.min((value / max) * 100, 100);

  return (
    <div className="space-y-1">
      {label && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium">{value}{max === 100 ? "%" : `/${max}`}</span>
        </div>
      )}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
