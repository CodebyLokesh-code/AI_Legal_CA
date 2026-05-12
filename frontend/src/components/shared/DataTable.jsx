import { motion } from "framer-motion"

export default function DataTable({ columns, data, loading, emptyText = "Koi data nahi mila" }) {
  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-8 text-center text-muted-foreground text-sm">{emptyText}</div>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 uppercase tracking-wide"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <motion.tr
                key={row._id || i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm text-foreground">
                    {col.render ? col.render(row[col.key], row) : row[col.key] || "—"}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}