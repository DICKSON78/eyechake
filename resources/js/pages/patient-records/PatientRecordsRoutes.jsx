import React from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import Patients from "./Patients";
import PatientRoutes from "./PatientRoutes";

// Redirect legacy links without the /patients segment to the current route shape.
const LegacyPatientFileRedirect = () => {
  const { patientId } = useParams();

  return (
    <Navigate
      to={`/patient-records/patients/${patientId}/patient-file`}
      replace
    />
  );
};

const PatientRecordsRoutes = () => {
  return (
    <Routes>
      <Route
        index
        element={<Navigate to="patients" replace />}
      />
      <Route
        path="patients"
        element={<Patients />}
      />
      <Route
        path="patients/:patientId/*"
        element={<PatientRoutes />}
      />
      <Route
        path="patient-file/:patientId"
        element={<LegacyPatientFileRedirect />}
      />
      <Route
        path="patient-file/:patientId/*"
        element={<LegacyPatientFileRedirect />}
      />
    </Routes>
  );
};

export default PatientRecordsRoutes;
