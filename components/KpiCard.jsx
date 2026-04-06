import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function KpiCard({ title, value, subtitle, icon: Icon, trend, className = "" }) {
  const trendColor = trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-muted-foreground";

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        {trend !== undefined && trend !== null && (
          <p className={`text-xs mt-1 ${trendColor}`}>
            {trend > 0 ? "+" : ""}{trend}% vs last period
          </p>
        )}
      </CardContent>
    </Card>
  );
}
