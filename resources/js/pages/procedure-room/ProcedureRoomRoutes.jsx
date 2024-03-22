import React from "react";
import { Route, Routes } from "react-router-dom";
import ProcedureRequests from "./procedure-requests/ProcedureRequests";
import ProcedureRequestRoutes from "./procedure-requests/ProcedureRequestRoutes";
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
        path="/procedure-requests/:patientId/:paymentCacheId/*"
        element={<ProcedureRequestRoutes />}
      />
      <Route
        path="/reports/*"
        element={<ReportsRoutes />}
      />
    </Routes>
  );
};

export default ProcedureRoomRoutes;
