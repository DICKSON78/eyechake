import React from "react";
import { Route, Routes } from "react-router-dom";
import Consultation from "./Consultation";
import OptometristMonthlyReport from "./OptometristMonthlyReport";
import PharmacyConsultationReport from "./PharmacyConsultationReport";
import PatientItems from "../../reports/PatientItems";

const ReportsRoutes = () => {
  return (
    <Routes>
      <Route
        path="/consultation"
        element={<Consultation />}
      />
      <Route
        path="/optometrist-monthly-report"
        element={<OptometristMonthlyReport />}
      />
      <Route
        path="/pharmacy-consultation-report"
        element={<PharmacyConsultationReport />}
      />
      <Route
        path="/served-procedures"
        element={
          <PatientItems
            module="Consultation Room"
            title="Served Procedures Report"
            consultationType="Procedure"
            status="Served"
          />
        }
      />
      <Route
        path="/pending-procedures"
        element={
          <PatientItems
            module="Consultation Room"
            title="Pending Procedures Report"
            consultationType="Procedure"
            status="Pending,Paid,Billed"
          />
        }
      />
    </Routes>
  );
};

export default ReportsRoutes;
