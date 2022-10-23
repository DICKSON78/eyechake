import React from "react";
import { Route, Routes } from "react-router-dom";
import PendingCashPayments from "./pending-cash-patients/PendingCashPatients";
import PendingCashPatientItems from "./pending-cash-patients/PendingPatientItems";
import PendingCreditPatients from "./pending-credit-patients/PendingCreditPatients";
import PendingCreditPatientItems from "./pending-credit-patients/PendingPatientItems";

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
    </Routes>
  );
};

export default PaymentCenterRoutes;
