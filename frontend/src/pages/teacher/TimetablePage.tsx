import React, { useEffect, useState } from "react";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import api, { getSavedUser } from "../../lib/api";

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

interface SchoolClass {
  id: number;
  name: string;
  section: string;
}

export const TimetablePage: React.FC = () => {
  const [schedule, setSchedule] = useState<TimetableItem[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedDay, setSelectedDay] = useState("all");
  const [loading, setLoading] = useState(true);

  // Add Period Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    classId: 1,
    className: "Class 10 - Blue",
    dayOfWeek: "Monday",
    periodNumber: 1,
    startTime: "08:30",
    endTime: "09:15",
    subject: "Physics",
    teacherName: "Sir Tariq Aziz",
    roomNumber: "Lab-1",
  });

  const currentUser = getSavedUser();

  const loadTimetable = async () => {
    try {
      setLoading(true);
      const [ttData, clsData] = await Promise.all([
        api.get<TimetableItem[]>("/timetable"),
        api.get<SchoolClass[]>("/classes"),
      ]);
      setSchedule(ttData);
      setClasses(clsData);
    } catch (err) {
      console.error("Failed to load timetable", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimetable();
  }, []);

  const handleAddPeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cls = classes.find((c) => c.id === formData.classId);
      await api.post("/timetable", {
        ...formData,
        className: cls ? `${cls.name} - ${cls.section}` : formData.className,
      });
      setIsAddModalOpen(false);
      loadTimetable();
    } catch (err: any) {
      alert(err.message || "Failed to add timetable slot.");
    }
  };

  const filtered =
    selectedDay === "all"
      ? schedule
      : schedule.filter((s) => s.dayOfWeek.toLowerCase() === selectedDay.toLowerCase());

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Instructional Timetable &amp; Bell Schedule</h1>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            Academic periods, classroom room allocations, and daily faculty routine
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
          + Schedule New Period
        </Button>
      </div>

      <div
        className="panel-card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "var(--space-12) var(--space-16)",
          marginBottom: "var(--space-16)",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--color-text-muted)" }}>
            Filter Day of Week:
          </span>
          <div style={{ width: "180px" }}>
            <Select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              options={[
                { value: "all", label: "Full Working Week" },
                { value: "Monday", label: "Monday" },
                { value: "Tuesday", label: "Tuesday" },
                { value: "Wednesday", label: "Wednesday" },
                { value: "Thursday", label: "Thursday" },
                { value: "Friday", label: "Friday" },
                { value: "Saturday", label: "Saturday" },
              ]}
            />
          </div>
        </div>

        <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
          Showing <strong>{filtered.length}</strong> scheduled academic periods
        </div>
      </div>

      <div className="panel-card" style={{ padding: 0 }}>
        <DataTable
          columns={[
            {
              key: "dayOfWeek",
              header: "Day",
              render: (row: TimetableItem) => <strong>{row.dayOfWeek}</strong>,
            },
            {
              key: "periodNumber",
              header: "Period",
              render: (row: TimetableItem) => `Period ${row.periodNumber}`,
            },
            {
              key: "timings",
              header: "Timings",
              render: (row: TimetableItem) => (
                <span style={{ fontFamily: "monospace", fontSize: "12px" }}>
                  {row.startTime} - {row.endTime}
                </span>
              ),
            },
            { key: "className", header: "Class Section" },
            {
              key: "subject",
              header: "Curriculum Subject",
              render: (row: TimetableItem) => <strong>{row.subject}</strong>,
            },
            { key: "teacherName", header: "Instructing Teacher" },
            {
              key: "roomNumber",
              header: "Room / Lab",
              render: (row: TimetableItem) => (
                <span style={{ backgroundColor: "var(--color-bg-hover)", padding: "2px 6px", borderRadius: "4px", fontSize: "11px" }}>
                  {row.roomNumber}
                </span>
              ),
            },
          ]}
          data={filtered}
          pageSize={10}
          emptyMessage={loading ? "Loading timetable..." : "No lectures scheduled."}
        />
      </div>

      {/* Add Period Modal */}
      <Modal
        isOpen={isAddModalOpen}
        title="Schedule New Lecture Period"
        onClose={() => setIsAddModalOpen(false)}
        footer={
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <Button variant="secondary" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddPeriod}>
              Add to Schedule
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAddPeriod} className="form-layout">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <Select
              label="Class &amp; Section"
              value={formData.classId.toString()}
              onChange={(e) => setFormData({ ...formData, classId: parseInt(e.target.value, 10) })}
              options={classes.map((c) => ({
                value: c.id.toString(),
                label: `${c.name} (${c.section})`,
              }))}
            />

            <Select
              label="Day of Week"
              value={formData.dayOfWeek}
              onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
              options={[
                { value: "Monday", label: "Monday" },
                { value: "Tuesday", label: "Tuesday" },
                { value: "Wednesday", label: "Wednesday" },
                { value: "Thursday", label: "Thursday" },
                { value: "Friday", label: "Friday" },
                { value: "Saturday", label: "Saturday" },
              ]}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
            <Input
              label="Period #"
              type="number"
              value={formData.periodNumber.toString()}
              onChange={(e) => setFormData({ ...formData, periodNumber: parseInt(e.target.value, 10) || 1 })}
              min="1"
              max="9"
              required
            />
            <Input
              label="Start Time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              placeholder="08:30"
              required
            />
            <Input
              label="End Time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              placeholder="09:15"
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <Input
              label="Subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g. Physics"
              required
            />
            <Input
              label="Room / Lab Location"
              value={formData.roomNumber}
              onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
              placeholder="e.g. Room 10, Lab 1"
              required
            />
          </div>

          <Input
            label="Instructing Teacher Name"
            value={formData.teacherName}
            onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
            placeholder="e.g. Sir Tariq Aziz"
            required
          />
        </form>
      </Modal>
    </div>
  );
};

export default TimetablePage;
