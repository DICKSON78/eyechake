import React from "react";
import { Route, Routes } from "react-router-dom";
import Expenses from "./expenses/Expenses";
import ReportsRoutes from "./reports/ReportsRoutes";

const FinancialManagementRoutes = () => {
  return (
    <Routes>
      <Route
        path="/expenses"
        element={<Expenses />}
      />
      <Route
        path="/reports/*"
        element={<ReportsRoutes />}
      />
    </Routes>
  );
};

export default FinancialManagementRoutes;
