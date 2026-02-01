import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import PatientRegistration from "./PatientRegistration";
import ReceptionistMonthlyReport from "./ReceptionistMonthlyReport";
import PatientItems from "../../reports/PatientItems";

const ReportsRoutes = () => {
  return (
    <Routes>
      <Route index element={<Navigate to="/reception/reports/patient-registration" replace />} />
      <Route
        path="/patient-registration"
        element={<PatientRegistration />}
      />
      <Route
        path="/receptionist-monthly-report"
        element={<ReceptionistMonthlyReport />}
      />
      <Route
        path="/items-dispensed"
        element={
          <PatientItems
            module="Reception"
            title="Items Dispensed Report"
            consultationType="Glass"
            status="Served"
          />
        }
      />
    </Routes>
  );
};

export default ReportsRoutes;
