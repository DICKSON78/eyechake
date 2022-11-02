import React from "react";
import { Route, Routes } from "react-router-dom";
import ItemBalance from "./ItemBalance";
import ItemQuantityDispensed from "./ItemQuantityDispensed";

const ReportsRoutes = () => {
  return (
    <Routes>
      <Route
        path="/item-balance"
        element={<ItemBalance />}
      />
      <Route
        path="/item-quantity-dispensed"
        element={<ItemQuantityDispensed />}
      />
    </Routes>
  );
};

export default ReportsRoutes;
