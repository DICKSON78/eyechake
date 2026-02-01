import React from "react";
import { Route, Routes } from "react-router-dom";
import UnitsOfMeasure from "./units-of-measure/UnitsOfMeasure";
import LensTypes from "./lens-types/LensTypes";
import Items from "./items/Items";
import ItemTypes from "./item-types/ItemTypes";
import ConsultationTypes from "./consultation-types/ConsultationTypes";

const ItemManagementRoutes = () => {
  return (
    <Routes>
      <Route
        path="/units-of-measure"
        element={<UnitsOfMeasure />}
      />
      <Route
        path="/lens-types"
        element={<LensTypes />}
      />
      <Route
        path="/item-types"
        element={<ItemTypes />}
      />
      <Route
        path="/consultation-types"
        element={<ConsultationTypes />}
      />
      <Route
        path="/items"
        element={<Items />}
      />
    </Routes>
  );
};

export default ItemManagementRoutes;
