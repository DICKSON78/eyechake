import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import SalesReport from "./SalesReport";
import SalesManagerMonthlyReport from "./SalesManagerMonthlyReport";
import SalesMonthlyReport from "./SalesMonthlyReport";
import CustomerRelationshipMonthlyReport from "./CustomerRelationshipMonthlyReport";

const ReportsRoutes = () => {
  return (
    <Routes>
      <Route
        path="sales"
        element={<SalesReport />}
      />
      <Route
        path="sales-manager-monthly-report"
        element={<SalesManagerMonthlyReport />}
      />
      <Route
        path="sales-monthly-report"
        element={<SalesMonthlyReport />}
      />
      <Route
        path="customer-relationship-monthly-report"
        element={<CustomerRelationshipMonthlyReport />}
      />
      <Route
        path=""
        element={<Navigate to="sales" />}
      />
    </Routes>
  );
};

export default ReportsRoutes;


