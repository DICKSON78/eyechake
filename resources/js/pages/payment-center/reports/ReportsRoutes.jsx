import React from "react";
import { Route, Routes } from "react-router-dom";
import CashCollection from "./CashCollection";
import CreditCollection from "./CreditCollection";
import PatientBills from "./PatientBills";
import BillCollection from "./BillCollection";
import Expenses from "../../financial-management/reports/Expenses";

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
        element={<PatientBills status="Pending"/>}
      />
      <Route
        path="/cleared-patient-bills"
        element={<PatientBills status="Cleared"/>}
      />
      <Route
        path="/patient-bill-collection"
        element={<BillCollection />}
      />
      <Route
        path="/expenses"
        element={(
          <Expenses
            module="Payment Center"
            createdBy={window.user.id}
          />
        )}
      />
    </Routes>
  );
};

export default ReportsRoutes;
