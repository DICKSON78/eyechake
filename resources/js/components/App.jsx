import React, { useMemo, useState } from "react";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import { ToastContextProvider } from "../contexts/ToastContext";
import lightTheme from "../themes/light";
import darkTheme from "../themes/dark";

import AuthLayout from "../layouts/Auth";
import DefaultLayout from "../layouts/Default";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import ReceptionRoutes from "../pages/reception/ReceptionRoutes";
import PaymentCenterRoutes from "../pages/payment-center/PaymentCenterRoutes";
import ConsultationRoomRoutes from "../pages/consultation-room/ConsultationRoomRoutes";
import OpticianCenterRoutes from "../pages/optician-center/OpticianCenterRoutes";
import MedicineCenterRoutes from "../pages/medicine-center/MedicineCenterRoutes";
import ProcedureRoomRoutes from "../pages/procedure-room/ProcedureRoomRoutes";
import InventoryManagementRoutes from "../pages/inventory-management/InventoryManagementRoutes";
import MarketingRoutes from "../pages/marketing/MarketingRoutes";
import FinancialManagementRoutes from "../pages/financial-management/FinancialManagementRoutes";
import EmployeeManagementRoutes from "../pages/employee-management/EmployeeManagementRoutes";
import PatientRecordsRoutes from "../pages/patient-records/PatientRecordsRoutes";
import SettingsRoutes from "../pages/settings/SettingsRoutes";

const App = () => {
  const [themeMode, setThemeMode] = useState(
    window.localStorage.getItem("theme_mode") || "light"
  );

  const theme = useMemo(() => {
    return themeMode === "light" ? lightTheme : darkTheme;
  }, [themeMode]);

  const [user, setUser] = useState();
  const [smsBalance, setSmsBalance] = useState(0);

  return (
    <ThemeProvider theme={theme}>
      <ToastContextProvider>
        <CssBaseline />
        <GlobalStyles
          styles={{
            "*::selection": {
              backgroundColor: theme.palette.primary.main,
              color: "#fff",
            },
          }}
        />
        <Router>
          <Routes>
            <Route
              path="/"
              exact
              element={<Navigate to="/login" />}
            />
            <Route
              path="/"
              element={<AuthLayout />}
            >
              <Route
                path="/login"
                element={<Login />}
              />
            </Route>
            <Route
              path="/"
              element={
                <DefaultLayout
                  setThemeMode={setThemeMode}
                  setUser={setUser}
                  smsBalance={smsBalance}
                />
              }
            >
              <React.Fragment>
                <Route
                  path="dashboard"
                  element={
                    user && user.privileges.dashboard ? (
                      <Dashboard setSmsBalance={setSmsBalance} />
                    ) : null
                  }
                />
                <Route
                  path="patient-records/*"
                  element={<PatientRecordsRoutes />}
                />
                <Route
                  path="reception/*"
                  element={
                    user && user.privileges.reception ? (
                      <ReceptionRoutes />
                    ) : null
                  }
                />
                <Route
                  path="payment-center/*"
                  element={
                    user && user.privileges.payment_center ? (
                      <PaymentCenterRoutes />
                    ) : null
                  }
                />
                <Route
                  path="consultation-room/*"
                  element={
                    user && user.privileges.consultation_room ? (
                      <ConsultationRoomRoutes />
                    ) : null
                  }
                />
                <Route
                  path="optician-center/*"
                  element={
                    user && user.privileges.optician_center ? (
                      <OpticianCenterRoutes />
                    ) : null
                  }
                />
                <Route
                  path="medicine-center/*"
                  element={
                    user && user.privileges.medicine_center ? (
                      <MedicineCenterRoutes />
                    ) : null
                  }
                />
                <Route
                  path="procedure-room/*"
                  element={
                    user && user.privileges.procedure_room ? (
                      <ProcedureRoomRoutes />
                    ) : null
                  }
                />
                <Route
                  path="inventory-management/*"
                  element={
                    user && user.privileges.inventory_management ? (
                      <InventoryManagementRoutes />
                    ) : null
                  }
                />
                <Route
                  path="marketing/*"
                  element={
                    user && user.privileges.marketing ? (
                      <MarketingRoutes />
                    ) : null
                  }
                />
                <Route
                  path="financial-management/*"
                  element={
                    user && user.privileges.financial_management ? (
                      <FinancialManagementRoutes />
                    ) : null
                  }
                />
                <Route
                  path="employee-management/*"
                  element={
                    user && user.privileges.employee_management ? (
                      <EmployeeManagementRoutes />
                    ) : null
                  }
                />
                <Route
                  path="settings/*"
                  element={
                    user && user.privileges.settings ? <SettingsRoutes /> : null
                  }
                />
              </React.Fragment>
            </Route>
          </Routes>
        </Router>
      </ToastContextProvider>
    </ThemeProvider>
  );
};

export default App;
