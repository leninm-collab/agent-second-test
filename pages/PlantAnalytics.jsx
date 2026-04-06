import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plant } from "@/entities/Plant";
import { Division } from "@/entities/Division";
import { Shipment } from "@/entities/Shipment";
import MiniChart from "../components/MiniChart";
import DataTable from "../components/DataTable";
import FilterBar from "../components/FilterBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "../context/LanguageContext";
import _ from "lodash";

export default function PlantAnalytics() {
  const { t } = useLanguage();
  const [filters, setFilters] = useState({});

  const { data: plants = [], isLoading } = useQuery({
    queryKey: ["plants"],
    queryFn: () => Plant.list("name", 100),
  });
  const { data: divisions = [] } = useQuery({
    queryKey: ["divisions"],
    queryFn: () => Division.list("name", 50),
  });
  const { data: shipments = [] } = useQuery({
    queryKey: ["shipments"],
    queryFn: () => Shipment.list("-scheduled_date", 500),
  });

  const filterDefs = [
    { key: "division", label: t("division"), allLabel: t("allDivisions"), options: divisions.map((d) => ({ value: d.name, label: d.name })) },
    { key: "status", label: t("status"), allLabel: t("allStatuses"), options: ["operational", "maintenance", "closed"].map((s) => ({ value: s, label: t(s) })) },
  ];

  const filteredPlants = plants.filter((p) =>
    Object.entries(filters).every(([key, val]) => !val || val === "all" || p[key] === val)
  );

  const plantPerfData = filteredPlants.map((p) => ({
    name: p.name?.length > 10 ? p.name.slice(0, 10) + "…" : p.name,
    utilization: p.utilization_rate || 0,
    dispatch: p.on_time_dispatch_rate || 0,
  }));

  const divisionRevData = divisions.map((d) => {
    const divShipments = shipments.filter((s) => s.division === d.name);
    return { name: d.name, revenue: _.sumBy(divShipments, "cost") || 0, shipments: divShipments.length };
  });

  const plantColumns = [
    { key: "name", label: t("plant") },
    { key: "code", label: "Code" },
    { key: "location", label: t("location") },
    { key: "division", label: t("division") },
    { key: "status", label: t("status"), badge: true },
    { key: "capacity_tons_per_day", label: "Capacity (t/day)", format: "number" },
    { key: "avg_daily_shipments", label: "Avg Daily", format: "number" },
    { key: "utilization_rate", label: t("utilizationRate"), format: "percent" },
    { key: "on_time_dispatch_rate", label: t("dispatchRate"), format: "percent" },
    { key: "manager_name", label: "Manager" },
  ];

  const divisionColumns = [
    { key: "name", label: t("division") },
    { key: "code", label: "Code" },
    { key: "region", label: "Region" },
    { key: "head", label: "Division Head" },
    { key: "plant_count", label: "Plants", format: "number" },
    { key: "monthly_target_shipments", label: `${t("target")} (Shipments)`, format: "number" },
    { key: "monthly_target_revenue", label: `${t("target")} (Revenue)`, format: "currency" },
    { key: "status", label: t("status"), badge: true },
  ];

  if (isLoading) return <div className="p-6 text-center">{t("loading")}</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{t("plantAnalytics")}</h1>
      <FilterBar
        filters={filterDefs}
        values={filters}
        onChange={(key, val) => setFilters((f) => ({ ...f, [key]: val }))}
        onClear={() => setFilters({})}
      />
      <div className="grid md:grid-cols-2 gap-6">
        <MiniChart title={t("plantPerformance")} data={plantPerfData} type="bar" dataKeys={["utilization", "dispatch"]} height={240} />
        <MiniChart title={t("revenueByDivision")} data={divisionRevData} type="bar" dataKeys={["revenue"]} height={240} />
      </div>

      <Tabs defaultValue="plants">
        <TabsList>
          <TabsTrigger value="plants">{t("plant")}</TabsTrigger>
          <TabsTrigger value="divisions">{t("division")}</TabsTrigger>
        </TabsList>
        <TabsContent value="plants">
          <DataTable columns={plantColumns} data={filteredPlants} emptyMessage={t("noData")} />
        </TabsContent>
        <TabsContent value="divisions">
          <DataTable columns={divisionColumns} data={divisions} emptyMessage={t("noData")} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
