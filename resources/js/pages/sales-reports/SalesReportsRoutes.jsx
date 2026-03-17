import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import SalesReports from "./SalesReports";
import SalesPerformanceReportCard from "./performance-report-card/SalesPerformanceReportCard";

const SalesReportsRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<SalesReports />} />
      <Route
        path="performance-report-card"
        element={<SalesPerformanceReportCard />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default SalesReportsRoutes;
