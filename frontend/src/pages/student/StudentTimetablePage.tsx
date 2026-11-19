import React, { useEffect, useState } from "react";
import DataTable from "../../components/ui/DataTable";
import Select from "../../components/ui/Select";
import api from "../../lib/api";

interface TimetableItem {
  id: number;
  classId: number;
  className: string;
  dayOfWeek: string;
  periodNumber: number;
  startTime: string;
  endTime: string;
  subject: string;
  teacherName: string;
  roomNumber: string;
}

export const StudentTimetablePage: React.FC = () => {
  const [schedule, setSchedule] = useState<TimetableItem[]>([]);
  const [selectedDay, setSelectedDay] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTimetable() {
      try {
        setLoading(true);
        const data = await api.get<TimetableItem[]>("/timetable", {
          params: { classId: 1 },
        });
        setSchedule(data);
      } catch (err) {
        console.error("Failed to load timetable", err);
      } finally {
        setLoading(false);
      }
    }
    loadTimetable();
  }, []);

  const filtered = selectedDay === "all" ? schedule : schedule.filter((s) => s.dayOfWeek.toLowerCase() === selectedDay.toLowerCase());

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Weekly Class Routine &bull; Class 10 (Blue)</h1>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            Daily periods, lecture times, teachers, and room allocations
          </p>
        </div>
      </div>

      <div
        className="panel-card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "var(--space-12) var(--space-16)",
          marginBottom: "var(--space-16)",
        }}
      >
        <span style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--color-text-muted)" }}>
          Filter Day:
        </span>
        <div style={{ width: "160px" }}>
          <Select
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
            options={[
              { value: "all", label: "Full Week" },
              { value: "Monday", label: "Monday" },
              { value: "Tuesday", label: "Tuesday" },
              { value: "Wednesday", label: "Wednesday" },
              { value: "Thursday", label: "Thursday" },
              { value: "Friday", label: "Friday" },
            ]}
          />
        </div>
      </div>

      <div className="panel-card" style={{ padding: 0 }}>
        <DataTable
          columns={[
            { key: "dayOfWeek", header: "Day" },
            {
              key: "periodNumber",
              header: "Period",
              render: (row) => `Period ${row.periodNumber}`,
            },
            {
              key: "timings",
              header: "Time",
              render: (row) => `${row.startTime} - ${row.endTime}`,
            },
            {
              key: "subject",
              header: "Subject",
              render: (row) => <strong>{row.subject}</strong>,
            },
            { key: "teacherName", header: "Teacher" },
            { key: "roomNumber", header: "Room" },
          ]}
          data={filtered}
          pageSize={8}
          emptyMessage={loading ? "Loading class routine..." : "No lectures on this day."}
        />
      </div>
    </div>
  );
};

export default StudentTimetablePage;
