import React from "react";
import { Route, Routes } from "react-router-dom";
import ConsultationPatients from "./consultation-patients/ConsultationPatients";
import PatientRoutes from "./PatientRoutes";

const DoctorWorksRoutes = () => {
  return (
    <Routes>
      <Route
        path="/consultation-patients/pending"
        exact
        element={(
          <ConsultationPatients
            status="Pending"
            title="Patients Sent to Doctor"
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
        element={<PatientRoutes />}
      />
    </Routes>
  );
};

export default DoctorWorksRoutes;
