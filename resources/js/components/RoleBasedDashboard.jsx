import React from "react";
import { Navigate } from "react-router-dom";
import { useNotificationContext } from "../contexts/NotificationContext";

// Import all dashboard components
import DirectorDashboard from "../pages/director/dashboard/Dashboard";
import ReceptionDashboard from "../pages/reception/dashboard/Dashboard";
import CashierDashboard from "../pages/payment-center/dashboard/Dashboard";
import ConsultationRoomDashboard from "../pages/consultation-room/dashboard/Dashboard";
import SalesTableDashboard from "../pages/sales-management/dashboard/Dashboard";
import PharmacyDashboard from "../pages/medicine-center/dashboard/Dashboard";
import WorkshopDashboard from "../pages/optician-center/dashboard/Dashboard";
import StockManagementDashboard from "../pages/inventory-management/dashboard/Dashboard";
import FinancialManagementDashboard from "../pages/financial-management/dashboard/Dashboard";
import EmployeeManagementDashboard from "../pages/user-management/dashboard/Dashboard";
import DispensingDashboard from "../pages/dispensing/dashboard/Dashboard";
import ProcedureRoomDashboard from "../pages/procedure-room/dashboard/Dashboard";
import OtherDispensingDashboard from "../pages/other-dispensing/dashboard/Dashboard";
import SalesCenterDashboard from "../pages/sales-center/dashboard/Dashboard";

const RoleBasedDashboard = ({ user, setSmsBalance }) => {
  const { notifications } = useNotificationContext();

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = (user.role || "").toString().trim().toLowerCase();

  // Role-based dashboard routing
  const getDashboardComponent = () => {
    switch (role) {
      case "admin":
        return <DirectorDashboard setSmsBalance={setSmsBalance} notifications={notifications} />;

      case "director":
        return <DirectorDashboard setSmsBalance={setSmsBalance} notifications={notifications} />;

      case "receptionist":
        return <ReceptionDashboard setSmsBalance={setSmsBalance} notifications={notifications} />;

      case "cashier":
        return <CashierDashboard setSmsBalance={setSmsBalance} notifications={notifications} />;

      case "doctor":
      case "optometrist":
        return <ConsultationRoomDashboard setSmsBalance={setSmsBalance} notifications={notifications} />;

      case "sales manager":
      case "sales":
        return <SalesTableDashboard setSmsBalance={setSmsBalance} notifications={notifications} />;

      case "pharmacist":
        return <PharmacyDashboard setSmsBalance={setSmsBalance} notifications={notifications} />;

      case "optician":
      case "workshop":
        return <WorkshopDashboard setSmsBalance={setSmsBalance} notifications={notifications} />;

      case "storekeeper":
      case "inventory":
        return <StockManagementDashboard setSmsBalance={setSmsBalance} notifications={notifications} />;

      case "accountant":
      case "finance":
        return <FinancialManagementDashboard setSmsBalance={setSmsBalance} notifications={notifications} />;

      case "marketing officer":
        return <DirectorDashboard setSmsBalance={setSmsBalance} notifications={notifications} />;

      case "hr":
      case "employee management":
        return <EmployeeManagementDashboard setSmsBalance={setSmsBalance} notifications={notifications} />;

      case "dispensing":
        return <DispensingDashboard setSmsBalance={setSmsBalance} notifications={notifications} />;

      case "procedure room":
        return <ProcedureRoomDashboard setSmsBalance={setSmsBalance} notifications={notifications} />;

      case "other dispensing":
        return <OtherDispensingDashboard setSmsBalance={setSmsBalance} notifications={notifications} />;

      default:
        // Default to director dashboard for unknown roles
        return <DirectorDashboard setSmsBalance={setSmsBalance} notifications={notifications} />;
    }
  };

  return getDashboardComponent();
};

export default RoleBasedDashboard;
