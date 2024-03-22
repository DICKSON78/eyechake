import React from "react";
import { Route, Routes } from "react-router-dom";
import DispensingRequests from "./dispensing-requests/DispensingRequests";
import DispensingRequestItems from "./dispensing-requests/DispensingRequestItems";

const DispensingRoutes = ({ consultationType }) => {
  return (
    <Routes>
      <Route
        path="/"
        exact
        element={<DispensingRequests consultationType={consultationType} />}
      />
      <Route
        path="/:patientId/:paymentCacheId"
        element={<DispensingRequestItems consultationType={consultationType} />}
      />
    </Routes>
  );
};

export default DispensingRoutes;
