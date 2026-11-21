import React from "react";
import PerformanceAnalyticsView from "../../components/analytics/PerformanceAnalyticsView";

export const AnalyticsPage: React.FC = () => {
  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Academic &amp; Faculty Performance Analytics</h1>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            Institutional benchmarks, grade distribution curves, class-wise rankings, individual DMC reports, and teacher attendance effectiveness
          </p>
        </div>
      </div>

      <PerformanceAnalyticsView />
    </div>
  );
};

export default AnalyticsPage;
