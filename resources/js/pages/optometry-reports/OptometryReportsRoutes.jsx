import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import OptometryReports from "./OptometryReports";
import OptometryPerformanceReportCard from "./performance-report-card/OptometryPerformanceReportCard";

const OptometryReportsRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<OptometryReports />} />
      <Route
        path="performance-report-card"
        element={<OptometryPerformanceReportCard />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default OptometryReportsRoutes;
