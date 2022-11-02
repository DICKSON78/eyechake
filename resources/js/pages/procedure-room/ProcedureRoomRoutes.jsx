import React from "react";
import { Route, Routes } from "react-router-dom";
import ProcedureRequests from "./procedure-requests/ProcedureRequests";
import ProcedureRequestItems from "./procedure-requests/ProcedureRequestItems";
import ReportsRoutes from "./ReportsRoutes";

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
      <Route
        path="/reports/*"
        element={<ReportsRoutes />}
      />
    </Routes>
  );
};

export default ProcedureRoomRoutes;
