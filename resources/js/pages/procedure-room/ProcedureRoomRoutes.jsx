import React from "react";
import { Route, Routes } from "react-router-dom";
import ProcedureRequests from "./procedure-requests/ProcedureRequests";
import ProcedureRequestItems from "./procedure-requests/ProcedureRequestItems";

const ProcedureRoomRoutes = () => {
  return (
    <Routes>
      <Route
        path="/procedure-requests"
        exact
        element={<ProcedureRequests />}
      />
      <Route
        path="/procedure-requests/:patientId/:paymentCacheId"
        element={<ProcedureRequestItems />}
      />
    </Routes>
  );
};

export default ProcedureRoomRoutes;
