import React from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import ConsultationPatients from "./GlassPatients";
import ConsultationPatientRoutes from "./GlassPatientRoutes";
import DispensingRoutes from "../dispensing/DispensingRoutes";
import ReportsRoutes from "./ReportsRoutes";
import LensStock from "./lens-stock/LensStock";

const OpticianCenterRoutes = () => {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={<Dashboard />}
      />
      <Route
        path="/glass-patients"
        exact
        element={<ConsultationPatients />}
      />
      <Route
        path="/glass-patients/:patientId/:consultationId/*"
        element={<ConsultationPatientRoutes />}
      />
      <Route
        path="reports/*"
        element={<ReportsRoutes />}
      />
      <Route
        path="lens-stock"
        element={<LensStock />}
      />
    </Routes>
  );
};

export default OpticianCenterRoutes;
