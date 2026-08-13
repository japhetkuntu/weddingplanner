import type { ReactNode } from "react";
import { cn } from "../cn";
import { EmptyState } from "./EmptyState";

export interface DataGridColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  /** Tailwind width class, e.g. "w-[140px]". Omit for a flexible column. */
  width?: string;
  hideBelow?: "sm" | "md" | "lg";
}

export interface DataGridProps<T> {
  columns: DataGridColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  /** Plain string renders the default EmptyState title; pass a node for full control. */
  emptyMessage?: ReactNode;
}

const hideClasses = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
};

/** Grid-based responsive table matching the flat, bordered look used across the designs. */
export function DataGrid<T>({ columns, rows, rowKey, onRowClick, emptyMessage = "Nothing here yet." }: DataGridProps<T>) {
  if (rows.length === 0) {
    return typeof emptyMessage === "string" ? <EmptyState title={emptyMessage} compact /> : emptyMessage;
  }

  return (
    <div className="overflow-x-auto border border-[#ddd] bg-white">
      <table className="w-full min-w-[560px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[#ddd] bg-[#f1efec]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-3 py-2.5 text-[10px] font-bold uppercase tracking-[.08em] text-ink/60",
                  col.width,
                  col.hideBelow && hideClasses[col.hideBelow],
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn("border-b border-[#eee] last:border-b-0", onRowClick && "cursor-pointer hover:bg-bg-warm")}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn("px-3 py-3 align-middle", col.hideBelow && hideClasses[col.hideBelow])}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
