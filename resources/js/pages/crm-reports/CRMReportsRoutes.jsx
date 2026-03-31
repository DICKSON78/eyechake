import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import CRMPerformanceReportCard from "./performance-report-card/CRMPerformanceReportCard";
import LeadConversionReport from "./lead-conversion-report/LeadConversionReport";

const CRMReportsRoutes = () => {
  return (
    <Routes>
      <Route
        path="performance-report-card"
        element={<CRMPerformanceReportCard />}
      />
      <Route
        path="lead-conversion-report"
        element={<LeadConversionReport />}
      />
      <Route
        path=""
        element={<Navigate to="performance-report-card" />}
      />
    </Routes>
  );
};

export default CRMReportsRoutes;
