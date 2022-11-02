import React from "react";
import { Route, Routes } from "react-router-dom";
import Stocktaking from "./Stocktaking";
import ReportsRoutes from "./reports/ReportsRoutes";

const InventoryManagementRoutes = () => {
  return (
    <Routes>
      <Route
        path="/stocktaking"
        element={<Stocktaking />}
      />
      <Route
        path="/reports/*"
        element={<ReportsRoutes />}
      />
    </Routes>
  );
};

export default InventoryManagementRoutes;
