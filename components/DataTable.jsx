import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const STATUS_COLORS = {
  scheduled: "secondary", in_transit: "default", delivered: "outline",
  delayed: "destructive", cancelled: "destructive",
  active: "default", inactive: "secondary", prospect: "outline", churned: "destructive",
  operational: "default", maintenance: "secondary", closed: "destructive", suspended: "destructive",
};

export default function DataTable({ columns, data, emptyMessage = "No data." }) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-muted-foreground py-8 text-center">{emptyMessage}</p>;
  }

  return (
    <div className="border rounded-lg overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} className="text-xs whitespace-nowrap">{col.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow key={row.id || idx}>
              {columns.map((col) => (
                <TableCell key={col.key} className="text-sm whitespace-nowrap">
                  {col.render ? col.render(row[col.key], row) : col.badge ? (
                    <Badge variant={STATUS_COLORS[row[col.key]] || "secondary"} className="capitalize text-xs">
                      {row[col.key]?.replace("_", " ")}
                    </Badge>
                  ) : col.format === "currency" ? (
                    `$${(row[col.key] || 0).toLocaleString()}`
                  ) : col.format === "number" ? (
                    (row[col.key] || 0).toLocaleString()
                  ) : col.format === "percent" ? (
                    `${row[col.key] || 0}%`
                  ) : (
                    row[col.key] ?? "—"
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
