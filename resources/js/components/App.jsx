import React, { useMemo, useState } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { CssBaseline, GlobalStyles } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import lightTheme from "../themes/light";
import darkTheme from "../themes/dark";

import AuthLayout from "../layouts/Auth";
import DefaultLayout from "../layouts/Default";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import ReceptionRoutes from "../pages/reception/ReceptionRoutes";
import SettingsRoutes from "../pages/settings/SettingsRoutes";
import Users from "../pages/users/Users";

const App = () => {
  const [themeMode, setThemeMode] = useState("light");

  const theme = useMemo(() => {
    return themeMode === "light" ? lightTheme : darkTheme;
  }, [themeMode]);

  const [user, setUser] = useState();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          "*": {
            scrollbarWidth: "thin"
          },

          "*::-webkit-scrollbar": {
            width: 8,
            height: 8
          },

          "*::-webkit-scrollbar-thumb": {
            borderRadius: 8,
          },
          "*::selection": {
            backgroundColor: theme.palette.primary.main,
            color: "#fff"
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
            element={<DefaultLayout setThemeMode={setThemeMode} setUser={setUser} />}
          >
            <Route
              path="dashboard"
              element={<Dashboard />}
            />
            <Route
              path="reception/*"
              element={<ReceptionRoutes />}
            />
            <Route
              path="settings/*"
              element={<SettingsRoutes />}
            />
            <Route
              path="users"
              element={(user && user.role === "Admin") ? <Users /> : null}
            />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
