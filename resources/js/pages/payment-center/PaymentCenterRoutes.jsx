import React from "react";
import { Route, Routes } from "react-router-dom";
import PatientsSentToCashier from "./patients-sent-to-cashier/PatientsSentToCashier";
import PendingPatientItems from "./patients-sent-to-cashier/PendingPatientItems";

const PaymentCenterRoutes = () => {
  return (
    <Routes>
      <Route
        path="/sent-to-cashier"
        exact
        element={<PatientsSentToCashier />}
      />
      <Route
        path="/sent-to-cashier/:patientId/:paymentCacheId"
        element={<PendingPatientItems />}
      />
    </Routes>
  );
};

export default PaymentCenterRoutes;
