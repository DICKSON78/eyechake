import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Keep only essential reports
import PatientRegistration from "./PatientRegistration";

const ReportsRoutes = () => {
  return (
    <Routes>
      <Route path="patient-registration" element={<PatientRegistration />} />
      
      {/* Redirect old routes to patient registration */}
      <Route path="new-client-vs-return-client" element={<Navigate to="/reports/patient-registration" replace />} />
      <Route path="unreachable-calls" element={<Navigate to="/reports/patient-registration" replace />} />
      <Route path="marketing-campaign-performance" element={<Navigate to="/reports/patient-registration" replace />} />
      <Route path="lead-generation" element={<Navigate to="/reports/patient-registration" replace />} />
      <Route path="communication-analyst" element={<Navigate to="/reports/patient-registration" replace />} />
    </Routes>
  );
};

export default ReportsRoutes;
