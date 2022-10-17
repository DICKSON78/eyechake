import React from "react";
import { Route, Routes } from "react-router-dom";

import ItemManagementRoutes from "./item-management/ItemManagementRoutes";
import PaymentModes from "./payment-modes/PaymentModes";
import PaymentChannels from "./payment-channels/PaymentChannels";
import Diseases from "./diseases/Diseases";

const SettingsRoutes = () => {
  return (
    <Routes>
      <Route path="/item-management/*" element={<ItemManagementRoutes />}/>
      <Route path="/payment-modes" element={<PaymentModes />}/>
      <Route path="/payment-channels" element={<PaymentChannels />}/>
      <Route path="/diseases" element={<Diseases />}/>
    </Routes>
  );
};

export default SettingsRoutes;
