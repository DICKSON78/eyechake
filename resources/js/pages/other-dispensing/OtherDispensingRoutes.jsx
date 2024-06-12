import React from "react";
import { Route, Routes } from "react-router-dom";
import DispensingRoutes from "../dispensing/DispensingRoutes";
import ReportsRoutes from "./ReportsRoutes";

const OtherDispensingRoutes = () => {
  return (
    <Routes>
      <Route
        path="dispensing-requests/*"
        element={<DispensingRoutes consultationType="Others" stockItem="Yes" />}
      />
      <Route
        path="reports/*"
        element={<ReportsRoutes />}
      />
    </Routes>
  );
};

export default OtherDispensingRoutes;
