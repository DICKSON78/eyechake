import React from "react";
import { Route, Routes } from "react-router-dom";
import DispensingRoutes from "../dispensing/DispensingRoutes";

const MedicineCenterRoutes = () => {
  return (
    <Routes>
      <Route
        path="dispensing-requests/*"
        element={<DispensingRoutes consultationType="Pharmacy"/>}
      />
    </Routes>
  );
};

export default MedicineCenterRoutes;
