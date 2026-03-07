import React from "react";
import { Route, Routes } from "react-router-dom";
import Consultation from "./Consultation";
import OptometristMonthlyReport from "./OptometristMonthlyReport";
import PharmacyConsultationReport from "./PharmacyConsultationReport";

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
    </Routes>
  );
};

export default ReportsRoutes;
