import React from "react";
import { Route, Routes } from "react-router-dom";
import UserRegistration from "./users/UserRegistration";
import Users from "./users/Users";
import AppointmentRequests from "./appointment-requests/AppointmentRequests";

const UserManagementRoutes = () => {
  return (
    <Routes>
      <Route
        path="/users"
        exact
        element={<Users />}
      />
      <Route
        path="/users/new"
        element={<UserRegistration />}
      />
      <Route
        path="/appointment-requests"
        element={<AppointmentRequests />}
      />
    </Routes>
  );
};

export default UserManagementRoutes;
