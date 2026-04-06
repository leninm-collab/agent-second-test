import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Customer } from "@/entities/Customer";
import DataTable from "../components/DataTable";
import MiniChart from "../components/MiniChart";
import FilterBar from "../components/FilterBar";
import { useLanguage } from "../context/LanguageContext";
import _ from "lodash";

export default function Customers() {
  const { t } = useLanguage();
  const [filters, setFilters] = useState({});

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: () => Customer.list("-total_revenue", 200),
  });

  const filterDefs = [
    { key: "segment", label: t("segment"), options: ["enterprise", "mid_market", "small_business", "startup"].map((s) => ({ value: s, label: t(s) })) },
    { key: "status", label: t("status"), allLabel: t("allStatuses"), options: ["active", "inactive", "prospect", "churned"].map((s) => ({ value: s, label: t(s) })) },
  ];

  const filtered = customers.filter((c) =>
    Object.entries(filters).every(([key, val]) => !val || val === "all" || c[key] === val)
  );

  const segmentData = _.map(_.groupBy(filtered, "segment"), (items, seg) => ({
    name: t(seg), value: items.length,
  }));

  const topCustomers = filtered.slice(0, 8).map((c) => ({
    name: c.name?.length > 15 ? c.name.slice(0, 15) + "…" : c.name,
    revenue: c.total_revenue || 0,
    shipments: c.total_shipments || 0,
  }));

  const columns = [
    { key: "name", label: t("customer") },
    { key: "segment", label: t("segment"), badge: true },
    { key: "status", label: t("status"), badge: true },
    { key: "location", label: t("location") },
    { key: "total_shipments", label: t("shipmentCount"), format: "number" },
    { key: "total_revenue", label: t("revenue"), format: "currency" },
    { key: "satisfaction_score", label: t("satisfaction"), render: (v) => v ? `${v}/10` : "—" },
    { key: "last_shipment_date", label: t("lastShipment") },
    { key: "contact_person", label: t("contact") },
  ];

  if (isLoading) return <div className="p-6 text-center">{t("loading")}</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{t("customers")}</h1>
      <FilterBar
        filters={filterDefs}
        values={filters}
        onChange={(key, val) => setFilters((f) => ({ ...f, [key]: val }))}
        onClear={() => setFilters({})}
      />
      <div className="grid md:grid-cols-2 gap-6">
        <MiniChart title={t("customerSegments")} data={segmentData} type="pie" dataKeys={["value"]} height={220} />
        <MiniChart title={t("topCustomers")} data={topCustomers} type="bar" dataKeys={["revenue"]} height={220} />
      </div>
      <DataTable columns={columns} data={filtered} emptyMessage={t("noData")} />
    </div>
  );
}
