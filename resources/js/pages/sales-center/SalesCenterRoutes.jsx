import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import ReportsRoutes from "./reports/ReportsRoutes";
import Clients from "./clients/Clients";
import Prescriptions from "./prescriptions/Prescriptions";

const SalesCenterRoutes = () => {
  return (
    <Routes>
      <Route
        path="dashboard"
        element={<Dashboard />}
      />
      <Route
        path="clients"
        element={<Clients />}
      />
      <Route
        path="prescriptions"
        element={<Prescriptions />}
      />
      <Route
        path="reports/*"
        element={<ReportsRoutes />}
      />
      <Route
        path=""
        element={<Navigate to="dashboard" />}
      />
    </Routes>
  );
};

export default SalesCenterRoutes;

