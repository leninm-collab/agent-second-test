import { useQuery } from "@tanstack/react-query";
import { Transporter } from "@/entities/Transporter";
import { Shipment } from "@/entities/Shipment";
import DataTable from "../components/DataTable";
import MiniChart from "../components/MiniChart";
import ScoreBar from "../components/ScoreBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "../context/LanguageContext";
import _ from "lodash";

export default function Transporters() {
  const { t } = useLanguage();

  const { data: transporters = [], isLoading } = useQuery({
    queryKey: ["transporters"],
    queryFn: () => Transporter.list("-rating", 100),
  });
  const { data: shipments = [] } = useQuery({
    queryKey: ["shipments"],
    queryFn: () => Shipment.list("-scheduled_date", 500),
  });

  const comparisonData = transporters.filter((tr) => tr.status === "active").map((tr) => ({
    name: tr.name?.length > 10 ? tr.name.slice(0, 10) + "…" : tr.name,
    onTimeRate: tr.on_time_rate || 0,
    damageRate: tr.damage_rate || 0,
  }));

  const costData = transporters.filter((tr) => tr.status === "active").map((tr) => ({
    name: tr.name?.length > 10 ? tr.name.slice(0, 10) + "…" : tr.name,
    costPerKm: tr.avg_cost_per_km || 0,
  }));

  const columns = [
    { key: "name", label: t("transporter") },
    { key: "code", label: "Code" },
    { key: "status", label: t("status"), badge: true },
    { key: "fleet_size", label: t("fleetSize"), format: "number" },
    { key: "total_shipments", label: t("shipmentCount"), format: "number" },
    { key: "on_time_rate", label: t("onTimeRate"), format: "percent" },
    { key: "damage_rate", label: t("damageRate"), format: "percent" },
    { key: "avg_cost_per_km", label: t("costPerKm"), format: "currency" },
    { key: "rating", label: t("rating"), render: (v) => v ? `${v}/5` : "—" },
  ];

  if (isLoading) return <div className="p-6 text-center">{t("loading")}</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{t("transporters")}</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <MiniChart title={t("onTimeVsDelayed")} data={comparisonData} type="bar" dataKeys={["onTimeRate", "damageRate"]} height={220} />
        <MiniChart title={t("costPerKm")} data={costData} type="bar" dataKeys={["costPerKm"]} height={220} />
      </div>
      <DataTable columns={columns} data={transporters} emptyMessage={t("noData")} />
    </div>
  );
}
