import React from "react";
import { Route, Routes } from "react-router-dom";
import Expenses from "./Expenses";
import CashCollection from "../../payment-center/reports/CashCollection";
import CreditCollection from "../../payment-center/reports/CreditCollection";
import PatientBills from "../../payment-center/reports/PatientBills";
import BillCollection from "../../payment-center/reports/BillCollection";

const ReportsRoutes = () => {
  return (
    <Routes>
      <Route
        path="/cash-collection"
        element={<CashCollection module="Financial Management" />}
      />
      <Route
        path="/credit-collection"
        element={<CreditCollection module="Financial Management" />}
      />
      <Route
        path="/pending-patient-bills"
        element={(
          <PatientBills
            status="Pending"
            module="Financial Management"
          />
        )}
      />
      <Route
        path="/cleared-patient-bills"
        element={(
          <PatientBills
            status="Cleared"
            module="Financial Management"
          />
        )}
      />
      <Route
        path="/patient-bill-collection"
        element={<BillCollection module="Financial Management" />}
      />
      <Route
        path="/expenses"
        element={<Expenses />}
      />
    </Routes>
  );
};

export default ReportsRoutes;
