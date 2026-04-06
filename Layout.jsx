import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LayoutDashboard, Package, Users, Truck, Factory, BarChart3, Globe } from "lucide-react";
import { useLanguage, LanguageProvider } from "./context/LanguageContext";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { key: "dashboard", icon: LayoutDashboard, page: "Dashboard" },
  { key: "shipments", icon: Package, page: "Shipments" },
  { key: "customers", icon: Users, page: "Customers" },
  { key: "transporters", icon: Truck, page: "Transporters" },
  { key: "plantAnalytics", icon: Factory, page: "PlantAnalytics" },
  { key: "performance", icon: BarChart3, page: "Performance with edits" },
];

function LayoutContent({ children, currentPageName }) {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-lg">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-base">{t("appName")}</h1>
                <p className="text-[10px] text-muted-foreground">{t("appTagline")}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <nav className="flex items-center gap-0.5">
                {NAV_ITEMS.map((item) => {
                  const isActive = currentPageName === item.page;
                  return (
                    <Link
                      key={item.page}
                      to={createPageUrl(item.page)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive ? "bg-slate-100 text-slate-900" : "text-gray-500 hover:bg-gray-100"
                      }`}
                    >
                      <item.icon className="h-3.5 w-3.5" />
                      {t(item.key)}
                    </Link>
                  );
                })}
              </nav>
              <Button variant="outline" size="sm" onClick={toggleLanguage} className="gap-1.5 h-8 text-xs">
                <Globe className="h-3.5 w-3.5" />
                {language.toUpperCase()}
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-[1400px] mx-auto">{children}</main>
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <LanguageProvider>
      <LayoutContent currentPageName={currentPageName}>{children}</LayoutContent>
    </LanguageProvider>
  );
}
