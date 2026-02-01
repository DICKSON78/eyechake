import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import Clients from "./clients/Clients";
import StockClients from "../sales-center/clients/Clients";
import Prescriptions from "../sales-center/prescriptions/Prescriptions";
import Stocktaking from "../inventory-management/Stocktaking";
import StockAlerts from "../inventory-management/StockAlerts";
import LensList from "../inventory-management/lens-list/LensList";
import LensTracking from "../inventory-management/lens-tracking/LensTracking";
import ReportsRoutes from "./reports/ReportsRoutes";
import GlassPatientsRoutes from "../reception/glass-patients/GlassPatientsRoutes";
import PatientsSentToSales from "./patients-sent-to-sales/PatientsSentToSales";
import SalesPatientItems from "./patients-sent-to-sales/SalesPatientItems";
import SalesClinicalNotesList from "./clinical-notes/ClinicalNotesList";

const SalesManagementRoutes = () => {
  return (
    <Routes>
      <Route
        path="dashboard"
        element={<Dashboard />}
      />
      <Route
        path="clients"
        element={<Clients />}
      />
      <Route
        path="stock-clients"
        element={<StockClients />}
      />
      <Route
        path="prescriptions"
        element={<Prescriptions />}
      />
      <Route
        path="stocktaking"
        element={<Stocktaking />}
      />
      <Route
        path="stock-alerts"
        element={<StockAlerts />}
      />
      <Route
        path="lens-list"
        element={<LensList />}
      />
      <Route
        path="lens-tracking"
        element={<LensTracking />}
      />
      <Route
        path="reports/*"
        element={<ReportsRoutes />}
      />
      <Route
        path="glass-patients/*"
        element={<GlassPatientsRoutes />}
      />
      <Route
        path="patients-sent-to-sales"
        element={<PatientsSentToSales />}
      />
      <Route
        path="patients-sent-to-sales/:patientId/:paymentCacheId"
        element={<SalesPatientItems />}
      />
      <Route
        path="clinical-notes"
        element={<SalesClinicalNotesList />}
      />
      <Route
        path=""
        element={<Navigate to="dashboard" />}
      />
    </Routes>
  );
};

export default SalesManagementRoutes;

