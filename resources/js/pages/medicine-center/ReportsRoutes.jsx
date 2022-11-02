import React from "react";
import { Route, Routes } from "react-router-dom";
import PatientItems from "../reports/PatientItems";
import ItemBalance from "../inventory-management/reports/ItemBalance";

const ReportsRoutes = () => {
  return (
    <Routes>
      <Route
        path="/medicines-dispensed"
        element={(
          <PatientItems
            module="Medicine Center"
            title="Medicines Dispensed Report"
            consultationType="Pharmacy"
            status="Served"
          />
        )}
      />
      <Route
        path="/medicines-not-dispensed"
        element={(
          <PatientItems
            module="Medicine Center"
            title="Medicines Not Dispensed Report"
            consultationType="Pharmacy"
            status="Pending,Paid,Billed"
          />
        )}
      />
      <Route
        path="/item-balance"
        element={(
          <ItemBalance
            module="Medicine Center"
            consultationType="Pharmacy"
          />
        )}
      />
    </Routes>
  );
};

export default ReportsRoutes;
