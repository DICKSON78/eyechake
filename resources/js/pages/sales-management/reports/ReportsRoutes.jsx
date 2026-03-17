import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import SalesManagerMonthlyReport from "../../sales-center/reports/SalesManagerMonthlyReport";

const ReportsRoutes = () => {
  return (
    <Routes>
      <Route
        path="sales-manager-monthly-report"
        element={<SalesManagerMonthlyReport />}
      />
      <Route
        path=""
        element={<Navigate to="sales-manager-monthly-report" />}
      />
    </Routes>
  );
};

export default ReportsRoutes;

