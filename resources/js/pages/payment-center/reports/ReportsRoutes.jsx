import React from "react";
import { Route, Routes } from "react-router-dom";
import DailyCashCollection from "./DailyCashCollection";
import CreditCollection from "./CreditCollection";
import PatientBills from "./PatientBills";
import BillPayments from "./BillPayments";
import Expenses from "../../financial-management/reports/Expenses";

const ReportsRoutes = () => {
  return (
    <Routes>
      <Route
        path="/daily-cash-collection"
        element={<DailyCashCollection />}
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
        path="/patient-bill-payments"
        element={<BillPayments />}
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
