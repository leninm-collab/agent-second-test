import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shipment } from "@/entities/Shipment";
import { Plant } from "@/entities/Plant";
import { Transporter } from "@/entities/Transporter";
import MiniChart from "../components/MiniChart";
import KpiCard from "../components/KpiCard";
import FilterBar from "../components/FilterBar";
import { useLanguage } from "../context/LanguageContext";
import { Package, TrendingUp, Clock, AlertTriangle } from "lucide-react";
import _ from "lodash";

export default function Performance() {
  const { t } = useLanguage();
  const [filters, setFilters] = useState({});

  const { data: shipments = [], isLoading } = useQuery({
    queryKey: ["shipments"],
    queryFn: () => Shipment.list("-scheduled_date", 500),
  });
  const { data: plants = [] } = useQuery({
    queryKey: ["plants"],
    queryFn: () => Plant.list("name", 50),
  });
  const { data: transporters = [] } = useQuery({
    queryKey: ["transporters"],
    queryFn: () => Transporter.list("name", 50),
  });

  const uniqueDivisions = _.uniq(shipments.map((s) => s.division).filter(Boolean));
  const filterDefs = [
    { key: "shipment_type", label: t("shipmentType"), options: [{ value: "PTL", label: "PTL" }, { value: "FTL", label: "FTL" }] },
    { key: "plant", label: t("plant"), allLabel: t("allPlants"), options: plants.map((p) => ({ value: p.name, label: p.name })) },
    { key: "division", label: t("division"), allLabel: t("allDivisions"), options: uniqueDivisions.map((d) => ({ value: d, label: d })) },
    { key: "transporter", label: t("transporter"), allLabel: t("allTransporters"), options: transporters.map((tr) => ({ value: tr.name, label: tr.name })) },
  ];

  const filtered = shipments.filter((s) =>
    Object.entries(filters).every(([key, val]) => !val || val === "all" || s[key] === val)
  );

  const delivered = filtered.filter((s) => s.status === "delivered");
  const ptl = filtered.filter((s) => s.shipment_type === "PTL");
  const ftl = filtered.filter((s) => s.shipment_type === "FTL");
  const onTime = delivered.filter((s) => s.on_time).length;
  const onTimeRate = delivered.length > 0 ? ((onTime / delivered.length) * 100).toFixed(1) : 0;
  const delayedCount = filtered.filter((s) => s.status === "delayed").length;
  const avgCost = filtered.length > 0 ? (_.sumBy(filtered, "cost") / filtered.length).toFixed(0) : 0;

  const ptlFtlData = [
    { name: "PTL", shipments: ptl.length, cost: _.sumBy(ptl, "cost") || 0, weight: _.sumBy(ptl, "weight_kg") || 0 },
    { name: "FTL", shipments: ftl.length, cost: _.sumBy(ftl, "cost") || 0, weight: _.sumBy(ftl, "weight_kg") || 0 },
  ];

  const byPlant = _(filtered).groupBy("plant").map((items, name) => ({
    name: name?.length > 10 ? name.slice(0, 10) + "…" : name,
    PTL: items.filter((i) => i.shipment_type === "PTL").length,
    FTL: items.filter((i) => i.shipment_type === "FTL").length,
  })).value();

  const byTransporter = _(filtered).groupBy("transporter").map((items, name) => {
    const del = items.filter((i) => i.status === "delivered");
    const ot = del.filter((i) => i.on_time).length;
    return {
      name: name?.length > 10 ? name.slice(0, 10) + "…" : name,
      onTimeRate: del.length > 0 ? Math.round((ot / del.length) * 100) : 0,
      shipments: items.length,
    };
  }).value();

  const byDivision = _(filtered).groupBy("division").map((items, name) => ({
    name: name || "N/A",
    revenue: _.sumBy(items, "cost") || 0,
    shipments: items.length,
  })).value();

  if (isLoading) return <div className="p-6 text-center">{t("loading")}</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{t("performance")}</h1>
      <FilterBar
        filters={filterDefs}
        values={filters}
        onChange={(key, val) => setFilters((f) => ({ ...f, [key]: val }))}
        onClear={() => setFilters({})}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title={t("totalShipments")} value={filtered.length} icon={Package} subtitle={`PTL: ${ptl.length} | FTL: ${ftl.length}`} />
        <KpiCard title={t("onTimeRate")} value={`${onTimeRate}%`} icon={TrendingUp} />
        <KpiCard title={t("delayed")} value={delayedCount} icon={AlertTriangle} className={delayedCount > 0 ? "border-red-200" : ""} />
        <KpiCard title={`Avg ${t("cost")}`} value={`$${Number(avgCost).toLocaleString()}`} icon={Clock} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <MiniChart title={t("ptlFtlBreakdown")} data={ptlFtlData} type="bar" dataKeys={["shipments", "cost"]} height={240} />
        <MiniChart title={t("performanceByPlant")} data={byPlant} type="bar" dataKeys={["PTL", "FTL"]} height={240} />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <MiniChart title={t("performanceByTransporter")} data={byTransporter} type="bar" dataKeys={["onTimeRate", "shipments"]} height={240} />
        <MiniChart title={t("performanceByDivision")} data={byDivision} type="bar" dataKeys={["revenue", "shipments"]} height={240} />
      </div>
    </div>
  );
}
