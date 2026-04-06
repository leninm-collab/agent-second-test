import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shipment } from "@/entities/Shipment";
import { Plant } from "@/entities/Plant";
import { Transporter } from "@/entities/Transporter";
import DataTable from "../components/DataTable";
import FilterBar from "../components/FilterBar";
import { useLanguage } from "../context/LanguageContext";
import _ from "lodash";

export default function Shipments() {
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
  const { data: transporterList = [] } = useQuery({
    queryKey: ["transporters"],
    queryFn: () => Transporter.list("name", 50),
  });

  const uniqueDivisions = _.uniq(shipments.map((s) => s.division).filter(Boolean));

  const filterDefs = [
    { key: "shipment_type", label: t("shipmentType"), allLabel: t("all"), options: [{ value: "PTL", label: "PTL" }, { value: "FTL", label: "FTL" }] },
    { key: "status", label: t("status"), allLabel: t("allStatuses"), options: ["scheduled", "in_transit", "delivered", "delayed", "cancelled"].map((s) => ({ value: s, label: t(s) })) },
    { key: "plant", label: t("plant"), allLabel: t("allPlants"), options: plants.map((p) => ({ value: p.name, label: p.name })) },
    { key: "division", label: t("division"), allLabel: t("allDivisions"), options: uniqueDivisions.map((d) => ({ value: d, label: d })) },
    { key: "transporter", label: t("transporter"), allLabel: t("allTransporters"), options: transporterList.map((tr) => ({ value: tr.name, label: tr.name })) },
  ];

  const filtered = shipments.filter((s) => {
    return Object.entries(filters).every(([key, val]) => !val || val === "all" || s[key] === val);
  });

  const columns = [
    { key: "shipment_number", label: "#" },
    { key: "shipment_type", label: t("shipmentType"), badge: true },
    { key: "status", label: t("status"), badge: true },
    { key: "plant", label: t("plant") },
    { key: "division", label: t("division") },
    { key: "transporter", label: t("transporter") },
    { key: "customer_name", label: t("customer") },
    { key: "origin", label: t("origin") },
    { key: "destination", label: t("destination") },
    { key: "weight_kg", label: t("weight"), format: "number" },
    { key: "cost", label: t("cost"), format: "currency" },
    { key: "scheduled_date", label: t("date") },
  ];

  if (isLoading) return <div className="p-6 text-center">{t("loading")}</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{t("shipments")}</h1>
      <FilterBar
        filters={filterDefs}
        values={filters}
        onChange={(key, val) => setFilters((f) => ({ ...f, [key]: val }))}
        onClear={() => setFilters({})}
      />
      <p className="text-sm text-muted-foreground">{filtered.length} {t("shipmentCount")}</p>
      <DataTable columns={columns} data={filtered} emptyMessage={t("noData")} />
    </div>
  );
}
