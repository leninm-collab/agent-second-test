import { useQuery } from "@tanstack/react-query";
import { Shipment } from "@/entities/Shipment";
import { Customer } from "@/entities/Customer";
import { Transporter } from "@/entities/Transporter";
import KpiCard from "../components/KpiCard";
import MiniChart from "../components/MiniChart";
import { Package, Truck, Clock, DollarSign, Users, AlertTriangle } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import _ from "lodash";

export default function Dashboard() {
  const { t } = useLanguage();

  const { data: shipments = [], isLoading } = useQuery({
    queryKey: ["shipments"],
    queryFn: () => Shipment.list("-scheduled_date", 500),
  });
  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => Customer.list("name", 200),
  });
  const { data: transporters = [] } = useQuery({
    queryKey: ["transporters"],
    queryFn: () => Transporter.filter({ status: "active" }, "name", 50),
  });

  const delivered = shipments.filter((s) => s.status === "delivered");
  const active = shipments.filter((s) => ["scheduled", "in_transit"].includes(s.status));
  const delayed = shipments.filter((s) => s.status === "delayed");
  const onTimeCount = delivered.filter((s) => s.on_time).length;
  const onTimeRate = delivered.length > 0 ? ((onTimeCount / delivered.length) * 100).toFixed(1) : 0;
  const totalRevenue = _.sumBy(shipments, "cost") || 0;
  const avgTransit = delivered.length > 0 ? (_.sumBy(delivered, "transit_days") / delivered.length).toFixed(1) : 0;
  const formatCurrency = (v) => "$" + v.toLocaleString(undefined, { maximumFractionDigits: 0 });

  const ptlCount = shipments.filter((s) => s.shipment_type === "PTL").length;
  const ftlCount = shipments.filter((s) => s.shipment_type === "FTL").length;
  const typeData = [{ name: t("ptl"), value: ptlCount }, { name: t("ftl"), value: ftlCount }];

  const statusData = ["scheduled", "in_transit", "delivered", "delayed", "cancelled"].map((s) => ({
    name: t(s), value: shipments.filter((sh) => sh.status === s).length,
  }));

  const byTransporter = _(shipments).groupBy("transporter").map((items, name) => ({
    name: name.length > 12 ? name.slice(0, 12) + "…" : name,
    PTL: items.filter((i) => i.shipment_type === "PTL").length,
    FTL: items.filter((i) => i.shipment_type === "FTL").length,
  })).value();

  if (isLoading) return <div className="p-6 text-center">{t("loading")}</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{t("dashboard")}</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard title={t("totalShipments")} value={shipments.length} icon={Package} />
        <KpiCard title={t("activeShipments")} value={active.length} icon={Truck} />
        <KpiCard title={t("onTimeRate")} value={`${onTimeRate}%`} icon={Clock} />
        <KpiCard title={t("totalRevenue")} value={formatCurrency(totalRevenue)} icon={DollarSign} />
        <KpiCard title={t("totalCustomers")} value={customers.length} icon={Users} />
        <KpiCard title={t("delayed")} value={delayed.length} icon={AlertTriangle} className={delayed.length > 0 ? "border-red-200" : ""} />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <MiniChart title={t("shipmentsByType")} data={typeData} type="pie" dataKeys={["value"]} height={220} />
        <MiniChart title={t("shipmentsByStatus")} data={statusData} type="bar" dataKeys={["value"]} height={220} />
        <MiniChart title={t("transporterPerformance")} data={byTransporter} type="bar" dataKeys={["PTL", "FTL"]} height={220} />
      </div>
    </div>
  );
}
