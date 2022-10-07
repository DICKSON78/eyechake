import React from "react";
import { Route, Routes } from "react-router-dom";
import PatientRegistration from "./patients/PatientRegistration";
import Patients from "./patients/Patients";
import CheckInPatient from "./CheckInPatient";

const ReceptionRoutes = () => {
  return (
    <Routes>
      <Route
        path="/patients"
        exact
        element={<Patients />}
      />
      <Route
        path="/patients/:id/check-in"
        element={<CheckInPatient />}
      />
      <Route
        path="/patients/new"
        element={<PatientRegistration />}
      />
    </Routes>
  );
};

export default ReceptionRoutes;
