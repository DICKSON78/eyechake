import React from "react";
import { Route, Routes } from "react-router-dom";
import ConsultationPatients from "./ConsultationPatients";
import ConsultationPatientRoutes from "./ConsultationPatientRoutes";
import ReportsRoutes from "./reports/ReportsRoutes";

const ConsultationRoomRoutes = () => {
  return (
    <Routes>
      <Route
        path="/consultation-patients/:status"
        exact
        element={<ConsultationPatients />}
      />
      <Route
        path="/consultation-patients/:status/:patientId/:consultationId/*"
        element={<ConsultationPatientRoutes />}
      />
      <Route
        path="/reports/*"
        element={<ReportsRoutes />}
      />
    </Routes>
  );
};

export default ConsultationRoomRoutes;
