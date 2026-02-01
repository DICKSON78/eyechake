import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import EmailAlerts from "./email-alerts/EmailAlerts";
import WebsiteAppointments from "./website-appointments/WebsiteAppointments";

const ExternalLinksRoutes = () => {
  return (
    <Routes>
      <Route
        path="email-alerts"
        element={<EmailAlerts />}
      />
      <Route
        path="website-appointments"
        element={<WebsiteAppointments />}
      />
      <Route
        path=""
        element={<Navigate to="email-alerts" />}
      />
    </Routes>
  );
};

export default ExternalLinksRoutes;

