import React from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import DailyActivities from "./daily-activities/DailyActivities";
import Ideas from "./ideas/Ideas";
import ResearchPlans from "./research-plans/ResearchPlans";
import MarketingStrategies from "./marketing-strategies/MarketingStrategies";
import Events from "./events/Events";
import CommunicationLogs from "./communication-logs/CommunicationLogs";
import BulkSms from "./bulk-sms/BulkSms";
import WhatsAppExport from "./whatsapp-export/WhatsAppExport";
import UnreachableNumbers from "./unreachable-numbers/UnreachableNumbers";
import PrestigeClients from "./prestige-clients/PrestigeClients";
import ClientCallingStatus from "./client-calling-status/ClientCallingStatus";
import MarketingGlassPatients from "./glass-patients/MarketingGlassPatients";
import InformationSources from "./settings/information-sources/InformationSources";
import CreateInformationSource from "./settings/information-sources/CreateInformationSource";
import EditInformationSource from "./settings/information-sources/EditInformationSource";
import HighValuePatients from "./high-value-patients/HighValuePatients";
import SettingsRoutes from "./settings/SettingsRoutes";
import ReportsRoutes from "./reports/ReportsRoutes";
import MarketingContactAnalytics from "../crm-reports/marketing-contact-analytics/MarketingContactAnalytics";

const MarketingRoutes = () => {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={<Dashboard />}
      />
      <Route
        path="/daily-activities"
        element={<DailyActivities />}
      />
      <Route
        path="/high-value-patients"
        element={<HighValuePatients />}
      />
      <Route
        path="/ideas"
        element={<Ideas />}
      />
      <Route
        path="/research-plans"
        element={<ResearchPlans />}
      />
      <Route
        path="/marketing-strategies"
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
        path="/client-calling-status"
        element={<ClientCallingStatus />}
      />
      <Route
        path="/glass-patients"
        element={<MarketingGlassPatients />}
      />
      <Route
        path="/information-sources"
        element={<InformationSources />}
      />
      <Route
        path="/information-sources/create"
        element={<CreateInformationSource />}
      />
      <Route
        path="/information-sources/:id/edit"
        element={<EditInformationSource />}
      />
      <Route
        path="/settings/*"
        element={<SettingsRoutes />}
      />
      <Route
        path="/reports/*"
        element={<ReportsRoutes />}
      />
      <Route
        path="/prestige-clients"
        element={<PrestigeClients />}
      />
      <Route
        path="/marketing-contact-analytics"
        element={<MarketingContactAnalytics />}
      />
    </Routes>
  );
};

export default MarketingRoutes;
