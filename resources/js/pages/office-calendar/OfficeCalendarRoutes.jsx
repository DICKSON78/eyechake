import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Calendar from "./Calendar";
import Subscribers from "./subscribers/Subscribers";
import ContactSubmissions from "./contact-submissions/ContactSubmissions";

const OfficeCalendarRoutes = () => {
  return (
    <Routes>
      <Route
        path=""
        element={<Calendar />}
      />
      <Route
        path="subscribers"
        element={<Subscribers />}
      />
      <Route
        path="contact-submissions"
        element={<ContactSubmissions />}
      />
      <Route
        path="*"
        element={<Navigate to="" />}
      />
    </Routes>
  );
};

export default OfficeCalendarRoutes;

