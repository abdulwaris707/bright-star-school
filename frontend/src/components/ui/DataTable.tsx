import React, { useState } from "react";
import Button from "./Button";

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
  emptyMessage?: string;
  keyExtractor?: (item: T) => string | number;
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  pageSize = 10,
  emptyMessage = "No records found.",
  keyExtractor,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentData = data.slice(startIndex, startIndex + pageSize);

  return (
    <div className="datatable-wrapper">
      <div className="datatable-scroll">
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((row, index) => (
                <tr key={keyExtractor ? keyExtractor(row) : index}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row) : (row[col.key] ?? "-")}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{ textAlign: "center", padding: "var(--space-16)", color: "var(--color-text-muted)" }}
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="datatable-footer">
        <span>
          Showing {data.length === 0 ? 0 : startIndex + 1} -{" "}
          {Math.min(startIndex + pageSize, data.length)} of {data.length}
        </span>
        <div className="datatable-pagination">
          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          >
            Previous
          </Button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
