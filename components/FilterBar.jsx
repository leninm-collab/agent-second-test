import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function FilterBar({ filters, values, onChange, onClear }) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-wrap items-center gap-3">
      {filters.map((filter) => (
        <Select key={filter.key} value={values[filter.key] || "all"} onValueChange={(v) => onChange(filter.key, v)}>
          <SelectTrigger className="w-40 h-9 text-sm">
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{filter.allLabel || t("all")}</SelectItem>
            {filter.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
      {Object.values(values).some((v) => v && v !== "all") && (
        <Button variant="ghost" size="sm" onClick={onClear} className="h-9 text-xs">
          <X className="h-3 w-3 mr-1" />{t("clearFilters")}
        </Button>
      )}
    </div>
  );
}
