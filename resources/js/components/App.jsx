import React, { useMemo, useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import GlobalStyles from "@mui/material/GlobalStyles";
import { ThemeProvider } from "@mui/material/styles";
import { ToastContextProvider } from "../contexts/ToastContext";
import { FilterProvider } from "../contexts/FilterContext";
import { NotificationProvider } from "../contexts/NotificationContext";
import ErrorBoundary from "./ErrorBoundary";
import lightTheme from "../themes/light";
import darkTheme from "../themes/dark";
import navigationFix from "../utils/navigationFix";

import AuthLayout from "../layouts/Auth";
import DefaultLayout from "../layouts/Default";
import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import SalesExpenses from "../pages/dashboard/sales-expenses/SalesExpenses";
import PatientRegistration from "../pages/dashboard/patient-registration/PatientRegistration";
import ReceptionRoutes from "../pages/reception/ReceptionRoutes";
import PaymentCenterRoutes from "../pages/payment-center/PaymentCenterRoutes";
import ConsultationRoomRoutes from "../pages/consultation-room/ConsultationRoomRoutes";
import SalesCenterRoutes from "../pages/sales-center/SalesCenterRoutes";
import SalesManagementRoutes from "../pages/sales-management/SalesManagementRoutes";
import OpticianCenterRoutes from "../pages/optician-center/OpticianCenterRoutes";
import MedicineCenterRoutes from "../pages/medicine-center/MedicineCenterRoutes";
import ProcedureRoomRoutes from "../pages/procedure-room/ProcedureRoomRoutes";
import OtherDispensingRoutes from "../pages/other-dispensing/OtherDispensingRoutes";
import DispensingMainRoutes from "../pages/dispensing/DispensingMainRoutes";
import InventoryManagementRoutes from "../pages/inventory-management/InventoryManagementRoutes";
import MarketingRoutes from "../pages/marketing/MarketingRoutes";
import FinancialManagementRoutes from "../pages/financial-management/FinancialManagementRoutes";
import UserManagementRoutes from "../pages/user-management/UserManagementRoutes";
import PatientRecordsRoutes from "../pages/patient-records/PatientRecordsRoutes";
import DirectorRoutes from "../pages/director/DirectorRoutes";
import SettingsRoutes from "../pages/settings/SettingsRoutes";
import OfficeCalendarRoutes from "../pages/office-calendar/OfficeCalendarRoutes";
import ExternalLinksRoutes from "../pages/external-links/ExternalLinksRoutes";

import Home from "../Home";
import About from "../About";
import Features from "../Features";
import Services from "../Services";
import Books from "../Books";
import Blog from "../Blog";
import BlogArticle from "../BlogArticle";
import Eyeware from "../Eyeware";
import FAQ from "../FAQ";
import Testimonials from "../Testimonials";
import InsurancePayment from "../InsurancePayment";
import Privacy from "../Privacy";
import Terms from "../Terms";
import Cookies from "../Cookies";
import Contact from "../Contact";
import Appointment from "../pages/appointments/Appointment";

const App = () => {
  console.log('App component initializing...');

  const [themeMode, setThemeMode] = useState(
    window.localStorage.getItem("theme_mode") || "light"
  );

  const theme = useMemo(() => {
    return themeMode === "light" ? lightTheme : darkTheme;
  }, [themeMode]);

  const [user, setUser] = useState();
  const [smsBalance, setSmsBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Hide loading screen once React app is mounted
  useEffect(() => {
    // Small delay to ensure smooth transition
    const timer = setTimeout(() => {
      const rootElement = document.getElementById('root');
      if (rootElement) {
        const loadingContainer = rootElement.querySelector('.loading-container');
        if (loadingContainer) {
          loadingContainer.style.opacity = '0';
          loadingContainer.style.transition = 'opacity 0.5s ease-out';
          setTimeout(() => {
            loadingContainer.style.display = 'none';
            setIsLoading(false);
          }, 500);
        } else {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Global error handler to catch unhandled errors
  useEffect(() => {
    const handleError = (event) => {
      // Prevent default error display
      event.preventDefault();
      // Log error silently (only in console)
      if (process.env.NODE_ENV === 'development') {
        console.error('Unhandled error:', event.error);
      }
      return false;
    };

    const handleRejection = (event) => {
      // Prevent default unhandled rejection display
      event.preventDefault();
      if (process.env.NODE_ENV === 'development') {
        console.error('Unhandled promise rejection:', event.reason);
      }
      return false;
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  // Navigation fixes disabled to prevent interference with React Router
  // React.useEffect(() => {
  //   console.log('🔧 Applying global navigation fixes...');
  //   navigationFix.runAllFixes();
  // }, []);

  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary>
        <ToastContextProvider>
          <FilterProvider>
            <NotificationProvider>
              <CssBaseline />
            <GlobalStyles
              styles={{
            "*::selection": {
              backgroundColor: theme.palette.primary.main,
              color: "#fff",
            },
            html: {
              scrollBehavior: "smooth",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            },
            "html::-webkit-scrollbar": {
              display: "none",
            },
            body: {
              overflowY: "auto",
                  scrollbarWidth: "none",
              msOverflowStyle: "none",
            },
            "body::-webkit-scrollbar": {
                  display: "none",
            },
            "*": {
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            },
            "*::-webkit-scrollbar": {
              display: "none",
            },
            // Text justify for all paragraphs and body text
            "p, .MuiTypography-body1, .MuiTypography-body2, .MuiTypography-paragraph": {
              textAlign: "justify",
              textJustify: "inter-word",
            },
            // Responsive text justify - only on larger screens
            "@media (max-width: 600px)": {
              "p, .MuiTypography-body1, .MuiTypography-body2": {
                textAlign: "justify",
                textJustify: "inter-word",
                hyphens: "auto",
                WebkitHyphens: "auto",
                MozHyphens: "auto",
              },
            },
          }}
        />
            <Router
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
          <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/features" element={<Features />} />
                <Route path="/services" element={<Services />} />
                <Route path="/books" element={<Books />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogArticle />} />
                <Route path="/gallery" element={<Eyeware />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/testimonials" element={<Testimonials />} />
                <Route path="/insurance-payment" element={<InsurancePayment />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/cookies" element={<Cookies />} />
                <Route path="/appointment" element={<Appointment />} />
                <Route path="/contact" element={<Contact />} />
                
                {/* Auth Routes */}
                <Route path="/login" element={<AuthLayout />} />
                {/* Redirect for common mis-typed routes */}
                <Route 
                  path="/cash-collection" 
                  element={<Navigate to="/financial-management/reports/cash-collection" replace />} 
                />
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
                    <Route path="dashboard" element={<Dashboard setSmsBalance={setSmsBalance} />} />
                    <Route path="dashboard/sales-expenses" element={<SalesExpenses />} />
                    <Route path="dashboard/patient-registration" element={<PatientRegistration />} />
                <Route path="reception/*" element={<ReceptionRoutes />} />
                <Route path="payment-center/*" element={<PaymentCenterRoutes />} />
                <Route path="consultation-room/*" element={<ConsultationRoomRoutes />} />
                <Route path="sales-center/*" element={<SalesCenterRoutes />} />
                <Route path="sales-management/*" element={<SalesManagementRoutes />} />
                <Route path="optician-center/*" element={<OpticianCenterRoutes />} />
                <Route path="medicine-center/*" element={<MedicineCenterRoutes />} />
                <Route path="pharmacy/*" element={<MedicineCenterRoutes />} />
                <Route path="procedure-room/*" element={<ProcedureRoomRoutes />} />
                <Route
                  path="dispensing/*"
                  element={<DispensingMainRoutes />}
                />
                <Route
                  path="other-dispensing/*"
                  element={<OtherDispensingRoutes />}
                />
                <Route path="inventory-management/*" element={<InventoryManagementRoutes />} />
                <Route path="marketing/*" element={<MarketingRoutes />} />
                <Route path="financial-management/*" element={<FinancialManagementRoutes />} />
                <Route path="user-management/*" element={<UserManagementRoutes />} />
                <Route path="director/*" element={<DirectorRoutes />} />
                <Route path="office-calendar/*" element={<OfficeCalendarRoutes />} />
                <Route path="external-links/*" element={<ExternalLinksRoutes />} />
                <Route path="settings/*" element={<SettingsRoutes />} />
                {/* Catch-all route for unmatched paths - redirect to dashboard */}
                <Route 
                  path="*" 
                  element={<Navigate to="/dashboard" replace />} 
                />
              </React.Fragment>
            </Route>
            {/* Catch-all for routes outside DefaultLayout */}
            <Route 
              path="*" 
              element={<Navigate to="/dashboard" replace />} 
            />
          </Routes>
        </Router>
          </NotificationProvider>
        </FilterProvider>
      </ToastContextProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
