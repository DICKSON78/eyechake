import React from "react";
import { Route, Routes } from "react-router-dom";
import DailyCashCollection from "./DailyCashCollection";
import DailyCreditCollection from "./DailyCreditCollection";
import Expenses from "../../financial-management/reports/Expenses";

const ReportsRoutes = () => {
  return (
    <Routes>
      <Route
        path="/daily-cash-collection"
        element={<DailyCashCollection />}
      />
      <Route
        path="/daily-credit-collection"
        element={<DailyCreditCollection />}
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
    </Routes>
  );
};

export default ReportsRoutes;
