import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import SalesReport from "../../sales-center/reports/SalesReport";
import SalesManagerMonthlyReport from "../../sales-center/reports/SalesManagerMonthlyReport";

const ReportsRoutes = () => {
  return (
    <Routes>
      <Route
        path="sales"
        element={<SalesReport />}
      />
      <Route
        path="sales-manager-monthly-report"
        element={<SalesManagerMonthlyReport />}
      />
      <Route
        path=""
        element={<Navigate to="sales" />}
      />
    </Routes>
  );
};

export default ReportsRoutes;

