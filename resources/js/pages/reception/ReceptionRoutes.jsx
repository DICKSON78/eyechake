import React from "react";
import { Route, Routes } from "react-router-dom";
import PatientRegistration from "./patients/PatientRegistration";
import Patients from "./patients/Patients";
import CheckInPatient from "./CheckInPatient";
import PatientsToReturn from "./patients-to-return/PatientsToReturn";
import SentMessages from "./sent-messages/Messages";
import ReportsRoutes from "./reports/ReportsRoutes";

const ReceptionRoutes = () => {
  return (
    <Routes>
      <Route
        path="/patients"
        exact
        element={<Patients />}
      />
      <Route
        path="/patients/:patientId/check-in"
        element={<CheckInPatient />}
      />
      <Route
        path="/patients/new"
        element={<PatientRegistration />}
      />
      <Route
        path="/to-return/patients"
        element={<PatientsToReturn />}
      />
      <Route
        path="/sent-messages"
        element={<SentMessages />}
      />
      <Route
        path="/reports/*"
        element={<ReportsRoutes />}
      />
    </Routes>
  );
};

export default ReceptionRoutes;
