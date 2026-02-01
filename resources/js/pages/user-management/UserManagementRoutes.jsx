import React from "react";
import { Route, Routes } from "react-router-dom";
import UserRegistration from "./users/UserRegistration";
import Users from "./users/Users";
import DoctorTasks from "./doctor-tasks/DoctorTasks";
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
        path="/doctor-tasks"
        element={<DoctorTasks />}
      />
      <Route
        path="/appointment-requests"
        element={<AppointmentRequests />}
      />
    </Routes>
  );
};

export default UserManagementRoutes;
