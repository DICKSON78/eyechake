import React from "react";
import { Route, Routes } from "react-router-dom";
import PendingCashPayments from "./pending-cash-patients/PendingCashPatients";
import PendingPatientItems from "./pending-cash-patients/PendingPatientItems";

const PaymentCenterRoutes = () => {
  return (
    <Routes>
      <Route
        path="/pending-cash-payments"
        exact
        element={<PendingCashPayments />}
      />
      <Route
        path="/pending-cash-payments/:patientId/:paymentCacheId"
        element={<PendingPatientItems />}
      />
    </Routes>
  );
};

export default PaymentCenterRoutes;
