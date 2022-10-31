import React from "react";
import { Route, Routes } from "react-router-dom";
import ConsultationPatients from "./ConsultationPatients";
import ConsultationPatientRoutes from "./ConsultationPatientRoutes";

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
    </Routes>
  );
};

export default ConsultationRoomRoutes;
