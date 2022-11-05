import React from "react";
import { Route, Routes } from "react-router-dom";
import Expenses from "./Expenses";

const ReportsRoutes = () => {
  return (
    <Routes>
      <Route
        path="/expenses"
        element={<Expenses />}
      />
    </Routes>
  );
};

export default ReportsRoutes;
