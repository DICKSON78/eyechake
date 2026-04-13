import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import EmployeePerformance from "./employee-performance/EmployeePerformance";
import ReportsRoutes from "./reports/ReportsRoutes";

const DirectorRoutes = () => {
  return (
    <Routes>
      {/* <Route
        path="dashboard"
        element={<Dashboard />}
      /> */}
      <Route
        path="employee-performance"
        element={<EmployeePerformance />}
      />
      {/* <Route
        path="reports/*"
        element={<ReportsRoutes />}
      /> */}
      <Route
        path=""
        element={<Navigate to="employee-performance" />}
      />
    </Routes>
  );
};

export default DirectorRoutes;

