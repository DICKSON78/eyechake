import React from "react";
import { Route, Routes } from "react-router-dom";
import DispensingRoutes from "../dispensing/DispensingRoutes";
import ReportsRoutes from "./ReportsRoutes";

const MedicineCenterRoutes = () => {
  return (
    <Routes>
      <Route
        path="dispensing-requests/*"
        element={<DispensingRoutes consultationType="Pharmacy" />}
      />
      <Route
        path="reports/*"
        element={<ReportsRoutes />}
      />
    </Routes>
  );
};

export default MedicineCenterRoutes;
