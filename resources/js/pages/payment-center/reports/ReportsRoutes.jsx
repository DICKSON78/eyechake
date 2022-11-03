import React from "react";
import { Route, Routes } from "react-router-dom";
import CashCollection from "./CashCollection";
import CreditCollection from "./CreditCollection";
import PatientBills from "./PatientBills";
import BillCollection from "./BillCollection";

const ReportsRoutes = () => {
  return (
    <Routes>
      <Route
        path="/cash-collection"
        element={<CashCollection />}
      />
      <Route
        path="/credit-collection"
        element={<CreditCollection />}
      />
      <Route
        path="/pending-patient-bills"
        element={<PatientBills status="Pending" />}
      />
      <Route
        path="/cleared-patient-bills"
        element={<PatientBills status="Cleared" />}
      />
      <Route
        path="/patient-bill-collection"
        element={<BillCollection />}
      />
    </Routes>
  );
};

export default ReportsRoutes;
