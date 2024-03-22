import React from "react";
import { Route, Routes } from "react-router-dom";
import EmployeeRegistration from "./employees/EmployeeRegistration";
import Employees from "./employees/Employees";

const EmployeeManagementRoutes = () => {
  return (
    <Routes>
      <Route
        path="/employees"
        exact
        element={<Employees />}
      />
      <Route
        path="/employees/new"
        element={<EmployeeRegistration />}
      />
    </Routes>
  );
};

export default EmployeeManagementRoutes;
