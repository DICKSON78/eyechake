import React from "react";
import { Route, Routes } from "react-router-dom";
import PaymentModes from "./payment-modes/PaymentModes";
import ItemManagementRoutes from "./item-management/ItemManagementRoutes";

const SettingsRoutes = () => {
  return (
    <Routes>
      <Route path="/payment-modes" element={<PaymentModes />}/>
      <Route path="/item-management/*" element={<ItemManagementRoutes />}/>
    </Routes>
  );
};

export default SettingsRoutes;
