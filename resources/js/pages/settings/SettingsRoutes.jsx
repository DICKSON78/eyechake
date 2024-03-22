import React from "react";
import { Route, Routes } from "react-router-dom";

import ItemManagementRoutes from "./item-management/ItemManagementRoutes";
import PaymentModes from "./payment-modes/PaymentModes";
import PaymentChannels from "./payment-channels/PaymentChannels";
import Diseases from "./diseases/Diseases";
import ExpenseCategories from "./expense-categories/ExpenseCategories";
import Departments from "./departments/Departments";
import JobTitles from "./job-titles/JobTitles";
import ClinicDetails from "./ClinicDetails";
import Preferences from "./Preferences";

const SettingsRoutes = () => {
  return (
    <Routes>
      <Route
        path="/item-management/*"
        element={<ItemManagementRoutes />}
      />
      <Route
        path="/payment-modes"
        element={<PaymentModes />}
      />
      <Route
        path="/payment-channels"
        element={<PaymentChannels />}
      />
      <Route
        path="/diseases"
        element={<Diseases />}
      />
      <Route
        path="/expense-categories"
        element={<ExpenseCategories />}
      />
      <Route
        path="/departments"
        element={<Departments />}
      />
      <Route
        path="/job-titles"
        element={<JobTitles />}
      />
      <Route
        path="/clinic-details"
        element={<ClinicDetails />}
      />
      <Route
        path="/preferences"
        element={<Preferences />}
      />
    </Routes>
  );
};

export default SettingsRoutes;
