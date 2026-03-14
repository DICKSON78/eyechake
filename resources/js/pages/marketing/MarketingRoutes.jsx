import React from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import Ideas from "./ideas/Ideas";
import ResearchPlans from "./research-plans/ResearchPlans";
import MarketingStrategies from "./marketing-strategies/MarketingStrategies";
import Events from "./events/Events";
import CommunicationLogs from "./communication-logs/CommunicationLogs";
import BulkSms from "./bulk-sms/BulkSms";
import WhatsAppExport from "./whatsapp-export/WhatsAppExport";
import UnreachableNumbers from "./unreachable-numbers/UnreachableNumbers";
import PatientRegistration from "./PatientRegistration";
import SettingsRoutes from "./settings/SettingsRoutes";
import ReportsRoutes from "./reports/ReportsRoutes";

const MarketingRoutes = () => {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={<Dashboard />}
      />
      <Route
        path="/high-value-patients"
        element={<HighValuePatients />}
      />
      <Route
        path="/idea-development"
        element={<Ideas />}
      />
      <Route
        path="/research-plans"
        element={<ResearchPlans />}
      />
      <Route
        path="/strategies"
        element={<MarketingStrategies />}
      />
      <Route
        path="/events"
        element={<Events eventType="Event" />}
      />
      <Route
        path="/appointments"
        element={<Events eventType="Appointment" />}
      />
      <Route
        path="/outreach-programmes"
        element={<Events eventType="Outreach Programme" />}
      />
      <Route
        path="/communication-logs"
        element={<CommunicationLogs />}
      />
      <Route
        path="/bulk-sms"
        element={<BulkSms />}
      />
      <Route
        path="/whatsapp-export"
        element={<WhatsAppExport />}
      />
      <Route
        path="/unreachable-numbers"
        element={<UnreachableNumbers />}
      />
      <Route
        path="/prestige-clients"
        element={<PrestigeClients />}
      />
      <Route
        path="/client-calling-status"
        element={<ClientCallingStatus />}
      />
      <Route
        path="/glass-patients"
        element={<MarketingGlassPatients />}
      />
      <Route
        path="/settings/*"
        element={<SettingsRoutes />}
      />
      <Route
        path="/reports/*"
        element={<ReportsRoutes />}
      />
    </Routes>
  );
};

export default MarketingRoutes;
