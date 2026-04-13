import React from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import PendingCashPayments from "./pending-cash-patients/PendingCashPatients";
import PendingCashPatientItems from "./pending-cash-patients/PendingPatientItems";
// Commented out: Credit Patient Approval
// import PendingCreditPatients from "./pending-credit-patients/PendingCreditPatients";
// import PendingCreditPatientItems from "./pending-credit-patients/PendingPatientItems";
import PatientBills from "./patient-bills/PatientBills";
import PatientBill from "./patient-bills/PatientBill";
import Expenses from "../financial-management/expenses/Expenses";
import ReportsRoutes from "./reports/ReportsRoutes";
import Invoice from "./invoice/Invoice";
import Invoices from "./invoice/Invoices";

const PaymentCenterRoutes = () => {
  return (
    <Routes>
      <Route
        path="/dashboard"
        exact
        element={<Dashboard />}
      />
      <Route
        path="/pending-cash-patients"
        exact
        element={<PendingCashPayments />}
      />
      <Route
        path="/pending-cash-patients/:patientId/:paymentCacheId"
        element={<PendingCashPatientItems />}
      />
      {/* Commented out: Credit Patient Approval routes
      <Route
        path="/pending-credit-patients"
        exact
        element={<PendingCreditPatients />}
      />
      <Route
        path="/pending-credit-patients/:patientId/:paymentCacheId"
        element={<PendingCreditPatientItems />}
      />
      */}
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
        path="/invoices"
        exact
        element={<Invoices />}
      />
      <Route
        path="/invoice/:paymentId"
        element={<Invoice />}
      />
      <Route
        path="/expenses"
        element={
          <Expenses
            module="Payment Center"
          />
        }
      />
      <Route
        path="/reports/*"
        element={<ReportsRoutes />}
      />
    </Routes>
  );
};

export default PaymentCenterRoutes;
