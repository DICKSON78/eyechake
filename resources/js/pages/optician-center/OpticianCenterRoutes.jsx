import React from "react";
import { Route, Routes } from "react-router-dom";
import ConsultationPatients from "./ConsultationPatients";
import ConsultationPatientRoutes from "./ConsultationPatientRoutes";
import DispensingRoutes from "../dispensing/DispensingRoutes";
import ReportsRoutes from "./ReportsRoutes";

const OpticianCenterRoutes = () => {
  return (
    <Routes>
      <Route
        path="/consultation-patients/pending"
        exact
        element={(
          <ConsultationPatients
            status="Pending"
            title="Patients Sent to Optician"
          />
        )}
      />
      <Route
        path="/consultation-patients/consulted"
        exact
        element={(
          <ConsultationPatients
            status="Consulted"
            title="Consulted Patients"
          />
        )}
      />
      <Route
        path="/consultation-patients/:status/:patientId/:consultationId/*"
        element={<ConsultationPatientRoutes />}
      />
      <Route
        path="dispensing-requests/*"
        element={<DispensingRoutes consultationType="Glass"/>}
      />
      <Route
        path="reports/*"
        element={<ReportsRoutes />}
      />
    </Routes>
  );
};

export default OpticianCenterRoutes;
