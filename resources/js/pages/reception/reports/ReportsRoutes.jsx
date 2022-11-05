import React from "react";
import { Route, Routes } from "react-router-dom";
import PatientRegistration from "./PatientRegistration";

const ReportsRoutes = () => {
  return (
    <Routes>
      <Route
        path="/patient-registration"
        element={<PatientRegistration />}
      />
    </Routes>
  );
};

export default ReportsRoutes;
