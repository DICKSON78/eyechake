import React from "react";
import { Route, Routes } from "react-router-dom";
import DispensingRequests from "./dispensing-requests/DispensingRequests";
import DispensingRequestItems from "./dispensing-requests/DispensingRequestItems";

const DispensingRoutes = ({ consultationType, stockItem }) => {
  return (
    <Routes>
      <Route
        path="/"
        exact
        element={
          <DispensingRequests
            consultationType={consultationType}
            stockItem={stockItem}
          />
        }
      />
      <Route
        path="/:patientId/:paymentCacheId"
        element={
          <DispensingRequestItems
            consultationType={consultationType}
            stockItem={stockItem}
          />
        }
      />
    </Routes>
  );
};

export default DispensingRoutes;
