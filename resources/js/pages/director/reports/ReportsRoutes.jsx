import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";

// Reception Reports
import PatientRegistration from "../../reception/reports/PatientRegistration";
import ReceptionistMonthlyReport from "../../reception/reports/ReceptionistMonthlyReport";

// Payment Center Reports
import DailyCashCollection from "../../payment-center/reports/DailyCreditCollection";
import CashierMonthlyReport from "../../payment-center/reports/CashierMonthlyReport";
import Expenses from "../../financial-management/reports/Expenses";

// Consultation Room Reports
import Consultation from "../../consultation-room/reports/Consultation";
import OptometristMonthlyReport from "../../consultation-room/reports/OptometristMonthlyReport";

// Sales Center Reports
import SalesReport from "../../sales-center/reports/SalesReport";
import SalesManagerMonthlyReport from "../../sales-center/reports/SalesManagerMonthlyReport";

// Financial Management Reports
import ExpensePayments from "../../financial-management/reports/ExpensePayments";
import CashCollection from "../../payment-center/reports/CashCollection";
import CreditCollection from "../../payment-center/reports/CreditCollection";
import PatientBills from "../../payment-center/reports/PatientBills";
import BillPayments from "../../payment-center/reports/BillPayments";
import BalanceSheet from "../../financial-management/reports/BalanceSheet";

// Marketing Reports
import MarketingPatientRegistration from "../../marketing/reports/PatientRegistration";
import CampaignPerformance from "../../marketing/reports/CampaignPerformance";
import LeadGeneration from "../../marketing/reports/LeadGeneration";
import CommunicationAnalytics from "../../marketing/reports/CommunicationAnalytics";
import MarketingOperationsMonthlyReport from "../../marketing/reports/MarketingOperationsMonthlyReport";
import MarketingManagementMonthlyReport from "../../marketing/reports/MarketingManagementMonthlyReport";

// Medicine Center Reports
import PatientItems from "../../reports/PatientItems";
import MedicineItemBalance from "../../medicine-center/reports/MedicineItemBalance";
import MedicineQuantityDispensed from "../../medicine-center/reports/MedicineQuantityDispensed";
import MedicineAlerts from "../../medicine-center/MedicineAlerts";

// Inventory Management Reports
import ItemBalance from "../../inventory-management/reports/ItemBalance";
import ItemQuantityDispensed from "../../inventory-management/reports/ItemQuantityDispensed";
import StockAlerts from "../../inventory-management/StockAlerts";

// Dispensing Reports
import ItemsDispensed from "../../dispensing/reports/ItemsDispensed";
import ItemsNotDispensed from "../../dispensing/reports/ItemsNotDispensed";
import DispensingItemBalance from "../../dispensing/reports/ItemBalance";

// Procedure Room Reports
// (Uses PatientItems component with different props)

// Optician Center Reports
// (Uses PatientItems and ItemBalance components with different props)

const ReportsRoutes = () => {
  return (
    <Routes>
      {/* Reception Reports */}
      <Route
        path="/reception/patient-registration"
        element={<PatientRegistration />}
      />
      <Route
        path="/reception/receptionist-monthly-report"
        element={<ReceptionistMonthlyReport />}
      />

      {/* Payment Center Reports */}
      <Route
        path="/payment-center/daily-cash-collection"
        element={<DailyCashCollection />}
      />
      <Route
        path="/payment-center/daily-credit-collection"
        element={<DailyCashCollection />}
      />
      <Route
        path="/payment-center/expenses"
        element={<Expenses module="Director" />}
      />
      <Route
        path="/payment-center/cashier-monthly-report"
        element={<CashierMonthlyReport />}
      />

      {/* Consultation Room Reports */}
      <Route
        path="/consultation-room/consultation"
        element={<Consultation />}
      />
      <Route
        path="/consultation-room/optometrist-monthly-report"
        element={<OptometristMonthlyReport />}
      />

      {/* Sales Center Reports */}
      <Route
        path="/sales-center/sales"
        element={<SalesReport />}
      />
      <Route
        path="/sales-center/sales-manager-monthly-report"
        element={<SalesManagerMonthlyReport />}
      />

      {/* Financial Management Reports */}
      <Route
        path="/financial-management/cash-collection"
        element={<CashCollection module="Director" />}
      />
      <Route
        path="/financial-management/credit-collection"
        element={<CreditCollection module="Director" />}
      />
      <Route
        path="/financial-management/pending-patient-bills"
        element={<PatientBills status="Pending" module="Director" />}
      />
      <Route
        path="/financial-management/cleared-patient-bills"
        element={<PatientBills status="Cleared" module="Director" />}
      />
      <Route
        path="/financial-management/patient-bill-payments"
        element={<BillPayments module="Director" />}
      />
      <Route
        path="/financial-management/expenses"
        element={<Expenses module="Director" />}
      />
      <Route
        path="/financial-management/expense-payments"
        element={<ExpensePayments />}
      />
      <Route
        path="/financial-management/balance-sheet"
        element={<BalanceSheet />}
      />

      {/* Marketing Reports */}
      <Route
        path="/marketing/patient-registration"
        element={<MarketingPatientRegistration />}
      />
      <Route
        path="/marketing/consultation"
        element={<Consultation />}
      />
      <Route
        path="/marketing/campaign-performance"
        element={<CampaignPerformance />}
      />
      <Route
        path="/marketing/lead-generation"
        element={<LeadGeneration />}
      />
      <Route
        path="/marketing/communication-analytics"
        element={<CommunicationAnalytics />}
      />
      <Route
        path="/marketing/marketing-operations-monthly-report"
        element={<MarketingOperationsMonthlyReport />}
      />
      <Route
        path="/marketing/marketing-management-monthly-report"
        element={<MarketingManagementMonthlyReport />}
      />

      {/* Medicine Center Reports */}
      <Route
        path="/medicine-center/dispensing/medicines-dispensed"
        element={
          <PatientItems
            module="Director"
            title="Medicines Dispensed Report"
            consultationType="Pharmacy"
            status="Served"
          />
        }
      />
      <Route
        path="/medicine-center/dispensing/medicines-not-dispensed"
        element={
          <PatientItems
            module="Director"
            title="Medicines Not Dispensed Report"
            consultationType="Pharmacy"
            status="Pending,Paid,Billed"
          />
        }
      />
      <Route
        path="/medicine-center/stock-management/item-balance"
        element={
          <MedicineItemBalance
            module="Director"
            consultationType="Pharmacy"
          />
        }
      />
      <Route
        path="/medicine-center/stock-management/item-quantity-dispensed"
        element={
          <MedicineQuantityDispensed
            module="Director"
            consultationType="Pharmacy"
          />
        }
      />
      <Route
        path="/medicine-center/medicine-alerts"
        element={<MedicineAlerts />}
      />

      {/* Inventory Management Reports */}
      <Route
        path="/inventory-management/stock-management/item-balance"
        element={<ItemBalance />}
      />
      <Route
        path="/inventory-management/stock-management/item-quantity-dispensed"
        element={<ItemQuantityDispensed />}
      />
      <Route
        path="/inventory-management/stock-alerts"
        element={<StockAlerts />}
      />

      {/* Dispensing Reports */}
      <Route
        path="/dispensing/items-dispensed"
        element={<ItemsDispensed />}
      />
      <Route
        path="/dispensing/items-not-dispensed"
        element={<ItemsNotDispensed />}
      />
      <Route
        path="/dispensing/item-balance"
        element={<DispensingItemBalance />}
      />

      {/* Optician Center Reports */
      <Route
        path="/optician-center/items-dispensed"
        element={
          <PatientItems
            module="Director"
            title="Items Dispensed Report"
            consultationType="Glass"
            status="Served"
          />
        }
      />
      <Route
        path="/optician-center/items-not-dispensed"
        element={
          <PatientItems
            module="Director"
            title="Items Not Dispensed Report"
            consultationType="Glass"
            status="Pending,Paid,Billed"
          />
        }
      />
      <Route
        path="/optician-center/item-balance"
        element={
          <ItemBalance
            module="Director"
            consultationType="Glass"
          />
        }
      />

      {/* Default route */}
      <Route
        path=""
        element={<Navigate to="/reception/patient-registration" replace />}
      />
    </Routes>
  );
};

export default ReportsRoutes;

