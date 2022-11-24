import React from "react";
import { Route, Routes } from "react-router-dom";
import PendingCashPayments from "./pending-cash-patients/PendingCashPatients";
import PendingCashPatientItems from "./pending-cash-patients/PendingPatientItems";
import PendingCreditPatients from "./pending-credit-patients/PendingCreditPatients";
import PendingCreditPatientItems from "./pending-credit-patients/PendingPatientItems";
import PatientBills from "./patient-bills/PatientBills";
import PatientBill from "./patient-bills/PatientBill";
import Expenses from "../financial-management/expenses/Expenses";
import ReportsRoutes from "./reports/ReportsRoutes";

const PaymentCenterRoutes = () => {
  return (
    <Routes>
      <Route
        path="/pending-cash-patients"
        exact
        element={<PendingCashPayments />}
      />
      <Route
        path="/pending-cash-patients/:patientId/:paymentCacheId"
        element={<PendingCashPatientItems />}
      />
      <Route
        path="/pending-credit-patients"
        exact
        element={<PendingCreditPatients />}
      />
      <Route
        path="/pending-credit-patients/:patientId/:paymentCacheId"
        element={<PendingCreditPatientItems />}
      />
      <Route
        path="/patient-bills/:status"
        exact
        element={<PatientBills />}
      />
      <Route
        path="/patient-bills/:status/:patientId/:billId"
        element={<PatientBill />}
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
      <Route
        path="/reports/*"
        element={<ReportsRoutes />}
      />
    </Routes>
  );
};

export default PaymentCenterRoutes;
