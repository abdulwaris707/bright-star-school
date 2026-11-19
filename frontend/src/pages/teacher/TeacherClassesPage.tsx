import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import api, { getSavedUser } from "../../lib/api";

interface SchoolClass {
  id: number;
  name: string;
  section: string;
  roomNumber: string;
  classTeacherId?: number;
  classTeacherName: string;
  studentCount: number;
}

interface Student {
  id: number;
  rollNo: string;
  fullName: string;
  parentName: string;
  phone: string;
  status: string;
}

export const TeacherClassesPage: React.FC = () => {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [rosterTarget, setRosterTarget] = useState<SchoolClass | null>(null);
  const [rosterStudents, setRosterStudents] = useState<Student[]>([]);
  const [loadingRoster, setLoadingRoster] = useState(false);

  const currentUser = getSavedUser();

  useEffect(() => {
    async function loadClasses() {
      try {
        const data = await api.get<SchoolClass[]>("/classes");
        setClasses(data);
      } catch (err) {
        console.error("Failed to load classes", err);
      } finally {
        setLoading(false);
      }
    }
    loadClasses();
  }, []);

  const openRosterModal = async (c: SchoolClass) => {
    setRosterTarget(c);
    setLoadingRoster(true);
    try {
      const data = await api.get<Student[]>("/students", { params: { classId: c.id } });
      setRosterStudents(data);
    } catch {
      setRosterStudents([]);
    } finally {
      setLoadingRoster(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Academic Classes &amp; Sections</h1>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            Assigned instructional sections, Class Teacher In-Charge designations, and student rosters
          </p>
        </div>
      </div>

      <div className="panel-card" style={{ padding: 0 }}>
        <DataTable
          columns={[
            {
              key: "name",
              header: "Class & Grade",
              render: (row: SchoolClass) => (
                <div>
                  <strong>{row.name}</strong>
                  <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                    Section {row.section} &bull; {row.roomNumber}
                  </div>
                </div>
              ),
            },
            {
              key: "incharge",
              header: "Your In-Charge Status",
              render: (row: SchoolClass) => {
                const isIncharge = currentUser && row.classTeacherId === currentUser.id;
                return isIncharge ? (
                  <Badge variant="active">Class In-Charge (Attendance Authority)</Badge>
                ) : (
                  <div>
                    <Badge variant="neutral">Subject Teacher</Badge>
                    <div style={{ fontSize: "10px", color: "var(--color-text-muted)", marginTop: "2px" }}>
                      Incharge: {row.classTeacherName}
                    </div>
                  </div>
                );
              },
            },
            {
              key: "studentCount",
              header: "Class Strength",
              render: (row: SchoolClass) => `${row.studentCount} Pupils`,
            },
            {
              key: "actions",
              header: "Classroom Tools",
              render: (row: SchoolClass) => {
                const isIncharge = currentUser && row.classTeacherId === currentUser.id;
                return (
                  <div style={{ display: "flex", gap: "var(--space-8)" }}>
                    <Button variant="secondary" size="sm" onClick={() => openRosterModal(row)}>
                      View Roster
                    </Button>
                    <Link to="/teacher/attendance">
                      <Button variant={isIncharge ? "primary" : "secondary"} size="sm">
                        {isIncharge ? "Take Attendance" : "View Register"}
                      </Button>
                    </Link>
                    <Link to="/teacher/marks">
                      <Button variant="secondary" size="sm">
                        Enter Marks
                      </Button>
                    </Link>
                  </div>
                );
              },
            },
          ]}
          data={classes}
          pageSize={10}
          emptyMessage={loading ? "Loading classes..." : "No classes assigned."}
        />
      </div>

      {/* Class Roster Modal */}
      {rosterTarget && (
        <Modal
          isOpen={Boolean(rosterTarget)}
          title={`Enrolled Students — ${rosterTarget.name} (${rosterTarget.section})`}
          onClose={() => setRosterTarget(null)}
          footer={
            <Button variant="secondary" size="sm" onClick={() => setRosterTarget(null)}>
              Close Roster
            </Button>
          }
        >
          <div>
            <div style={{ padding: "8px 12px", backgroundColor: "var(--color-bg-sidebar)", borderRadius: "var(--radius)", marginBottom: "12px", fontSize: "12px", display: "flex", justifyContent: "space-between" }}>
              <span>Total Enrolled: <strong>{rosterStudents.length} Students</strong></span>
              <span>Class Incharge: <strong>{rosterTarget.classTeacherName}</strong></span>
            </div>

            <DataTable
              columns={[
                { key: "rollNo", header: "Roll No", render: (s: Student) => <code>{s.rollNo}</code> },
                { key: "fullName", header: "Student Name", render: (s: Student) => <strong>{s.fullName}</strong> },
                { key: "parentName", header: "Father / Guardian" },
                { key: "phone", header: "Emergency Contact" },
                {
                  key: "status",
                  header: "Status",
                  render: (s: Student) => (
                    <Badge variant={s.status === "active" ? "active" : "inactive"}>
                      {s.status.toUpperCase()}
                    </Badge>
                  ),
                },
              ]}
              data={rosterStudents}
              pageSize={8}
              emptyMessage={loadingRoster ? "Loading roster..." : "No students enrolled in this section."}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default TeacherClassesPage;
