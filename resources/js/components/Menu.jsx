import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Typography,
} from "@mui/material";
import { useNotificationContext } from "../contexts/NotificationContext";
import { hasPrivilege, isAdmin } from "../helpers/privileges";

import {
  AddRounded as AddIcon,
  BadgeRounded as JobTitlesIcon,
  ContactsRounded as ClinicDetailsIcon,
  ContactMailRounded as ContactIcon,
  DoneAllRounded as DoneIcon,
  ExpandLessRounded as ExpandLessIcon,
  ExpandMoreRounded as ExpandMoreIcon,
  EventNoteRounded as AppointmentsIcon,
  EmailRounded as EmailIcon,
  GroupRounded as PeopleIcon,
  HomeRounded as HomeIcon,
  HourglassBottomRounded as WaitingIcon,
  InfoRounded as InfoIcon,
  Inventory2Rounded as ItemsIcon,
  LightbulbRounded as IdeaDevelopmentIcon,
  LibraryBooksRounded as ReportsIcon,
  AssignmentRounded as PrescriptionIcon,
  LocalActivityRounded as OutreachProgrammesIcon,
  LocalHospitalRounded as ClinicsIcon,
  LocationSearchingRounded as MarketResearchIcon,
  ManageAccountsRounded as UserManagementIcon,
  MedicationRounded as MedicineIcon,
  BusinessCenterRounded as DirectorIcon,
  CheckCircleRounded as CheckCircleIcon,
  MessageRounded as MessageIcon,
  MoneyRounded as PaymentModesIcon,
  PaymentRounded as PaymentChannelsIcon,
  PestControlRounded as DiseasesIcon,
  PhoneInTalkRounded as CommunicationLogsIcon,
  ScheduleRounded as PatientsToReturnIcon,
  SendRounded as MarketingStrategiesIcon,
  SettingsRounded as SettingsIcon,
  PointOfSaleRounded as SalesIcon,
  StarRounded as VipIcon,
  TaskAltRounded as DoctorTaskIcon,
  TaskRounded as DailyActivitiesIcon,
  ReceiptRounded as ReceiptIcon,
  AssessmentRounded as PerformanceIcon,
  TrendingDownRounded as ExpensesIcon,
  WarningRounded as WarningIcon,
  WindowRounded as DepartmentsIcon,
} from "@mui/icons-material";
import GlassPatientsIcon from "./icons/AddLens";

const SingleLevelMenuItem = ({ item, setDrawerOpen, location, navigate }) => {
  const isSelected = () => {
    if (location.pathname === item.to) {
      return true;
    }

    if (location.pathname.indexOf(item.to) === 0) {
      const nextChars = location.pathname.substring(item.to.length);
      if (/^\/.+/.test(nextChars)) {
        return true;
      }
    }

    return false;
  };

  return item.subheader ? (
    <ListSubheader sx={{ 
      px: { xs: 1, sm: 1, md: 1.5 },
      fontWeight: 700,
      fontSize: '0.7875rem'
    }}>
      {item.title}
    </ListSubheader>
  ) : (
    <ListItemButton
      selected={isSelected()}
      onClick={() => {
        navigate(item.to);
        if (typeof setDrawerOpen === "function") {
          setDrawerOpen(false);
        }
      }}
      sx={{
        color: "text.secondary",
        "& .MuiListItemIcon-root": {
          color: "inherit",
        },
        "&:hover, &.Mui-selected, &.Mui-selected:hover": {
          color: "primary.main",

          "& .MuiListItemIcon-root": {
            color: "inherit",
          },
        },
        "&.Mui-selected, &.Mui-selected:hover": {
          borderRight: (theme) => {
            const color = theme?.palette?.primary?.main;
            return color ? `4px solid ${color}` : '4px solid #345ea8';
          },
        },
        px: { xs: 1, sm: 1, md: 1.5 },
      }}
    >
      {item.icon ? (
        <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
      ) : null}
      <ListItemText primary={item.title} />
      {item.badge !== undefined && item.badge !== null && typeof item.badge === 'number' && item.badge > 0 ? (
        <Box
          ml={1}
          bgcolor="error.main"
          borderRadius={2}
          px={1}
          sx={{
            minWidth: '24px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'badgePop 0.5s ease-out',
            '@keyframes badgePop': {
              '0%': {
                transform: 'scale(0)',
                opacity: 0,
              },
              '50%': {
                transform: 'scale(1.2)',
              },
              '100%': {
                transform: 'scale(1)',
                opacity: 1,
              },
            },
          }}
        >
          <Typography
            color="error.contrastText"
            variant="caption"
            sx={{ fontSize: '0.75rem', fontWeight: 600 }}
          >
            {item.badge}
          </Typography>
        </Box>
      ) : null}
    </ListItemButton>
  );
};

const MultiLevelMenuItem = ({ item, location, generateMenuTree }) => {
  const [open, setOpen] = useState();

  return (
    <Box className="MuiListItem-multilevel">
      <ListItemButton
        selected={location.pathname.indexOf(item.to) === 0}
        onClick={(event) => setOpen(open === item.to ? null : item.to)}
        sx={{
          color: "text.secondary",
          "& .MuiListItemIcon-root": {
            color: "inherit",
          },
          "&:hover, &.Mui-selected, &.Mui-selected:hover": {
            color: "primary.main",

            "& .MuiListItemIcon-root": {
              color: "inherit",
            },
          },
          "&.Mui-selected, &.Mui-selected:hover": {
            borderRight: (theme) => {
              const color = theme?.palette?.primary?.main;
              return color ? `4px solid ${color}` : '4px solid #345ea8';
            },
          },
          px: { xs: 1, sm: 1, md: 1.5 },
        }}
      >
        {item.icon ? (
          <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
        ) : null}
        <ListItemText primary={item.title} />
        {item.badge !== undefined && item.badge !== null && typeof item.badge === 'number' && item.badge > 0 ? (
          <Box
            ml={1.5}
            bgcolor="error.main"
            borderRadius={2}
            px={1}
            sx={{
              minWidth: '24px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'badgePop 0.5s ease-out',
              '@keyframes badgePop': {
                '0%': {
                  transform: 'scale(0)',
                  opacity: 0,
                },
                '50%': {
                  transform: 'scale(1.2)',
                },
                '100%': {
                  transform: 'scale(1)',
                  opacity: 1,
                },
              },
            }}
          >
            <Typography
              color="error.contrastText"
              variant="caption"
              sx={{ fontSize: '0.75rem', fontWeight: 600 }}
            >
              {item.badge}
            </Typography>
          </Box>
        ) : null}
        {open === item.to ? (
          <ExpandLessIcon sx={{ ml: 0.5 }} />
        ) : (
          <ExpandMoreIcon sx={{ ml: 0.5 }} />
        )}
      </ListItemButton>

      <Collapse
        in={open === item.to}
        unmountOnExit
      >
        <List
          component="div"
          dense
          sx={{ pl: 2 }}
        >
          {generateMenuTree(item.items)}
        </List>
      </Collapse>
    </Box>
  );
};

const Menu = ({ drawerOpen, setDrawerOpen, user, ...rest }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);

  // Use NotificationContext for stable sidebar badges
  // Reference implementation: resources/js/pages/payment-center/pending-cash-patients/PendingCashPatients.jsx
  // Badge pattern: notifications && typeof notifications.KEY !== 'undefined' && notifications.KEY != null ? (Number(notifications.KEY) || 0) : 0
  const { notifications, loading: notificationsLoading } = useNotificationContext();

  // Debug notifications
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Menu - Notifications:', notifications);
      console.log('Menu - Notifications Loading:', notificationsLoading);
      if (notifications) {
        console.log('Menu - Badge values:', {
          patients_to_return: notifications.patients_to_return,
          patients_sent_to_cashier: notifications.patients_sent_to_cashier,
          credit_patients_approval: notifications.credit_patients_approval,
          patients_sent_to_doctor: notifications.patients_sent_to_doctor,
          patients_sent_to_optician: notifications.patients_sent_to_optician,
          dispensing_requests: notifications.dispensing_requests,
          other_dispensing_requests: notifications.other_dispensing_requests,
          procedure_requests: notifications.procedure_requests,
          vip_patients: notifications.vip_patients,
          patients_sent_to_sales: notifications.patients_sent_to_sales,
        });
      }
    }
  }, [notifications, notificationsLoading]);

  const renumberTopSections = (list) => {
    let counter = 0;
    return list.map((item) => {
      if (
        item?.subheader &&
        item?.title !== "MENU" &&
        typeof item.show === "boolean" &&
        item.show
      ) {
        const baseTitle = (item.title || "").replace(/^\d+\.\s*/, "");
        counter += 1;
        return { ...item, title: `${counter}. ${baseTitle}` };
      }
      return item;
    });
  };

  // Helper function to check if privilege is granted
  // Uses centralized privilege checking utility
  // Admins always have access to everything
  const isPrivilegeGranted = (privilegeKey) => {
    // If no privilege key provided, show the item (for items that don't need privileges)
    if (!privilegeKey) return true;
    const granted = hasPrivilege(user, privilegeKey);
    // Debug logging for privilege checks (always log for debugging)
    if (!granted && user && !isAdmin(user)) {
      console.log(`[Menu] Privilege check failed: ${privilegeKey}`, {
        user: user.username || user.id,
        privileges: user.privileges,
        privilegesType: typeof user.privileges,
        isAdmin: isAdmin(user)
      });
    }
    return granted;
  };

  useEffect(() => {
    if (user) {
      // Debug user privileges on menu load (always log for debugging)
      console.log('[Menu] User loaded:', {
        username: user.username,
        role: user.role,
        isAdmin: isAdmin(user),
        privileges: user.privileges,
        privilegesType: typeof user.privileges,
        privilegesKeys: user.privileges ? Object.keys(user.privileges) : []
      });
      
      // Check if user has sales_center access (admins automatically granted via hasPrivilege)
      const hasSalesCenterAccess = hasPrivilege(user, 'sales_center');
      console.log('[Menu] Sales center access:', hasSalesCenterAccess);
      
      setItems(renumberTopSections([
        {
          title: "MENU",
          subheader: true,
          show: true,
        },
        {
          title: "Dashboard",
          icon: <HomeIcon />,
          to: "/dashboard",
          show: isPrivilegeGranted('dashboard'),
        },
        {
          title: "1. RECEPTION",
          subheader: true,
          show: isPrivilegeGranted('reception'),
        },
        {
          title: "Reception Dashboard",
          icon: <HomeIcon />,
          to: "/reception/dashboard",
          show: isPrivilegeGranted('reception'),
        },
        {
          title: "Register new clients",
          icon: <PeopleIcon />,
          to: "/reception/register-new-client",
          show: isPrivilegeGranted('reception'),
        },
        {
          title: "Client Lists",
          icon: <PeopleIcon />,
          to: "/reception/patients",
          show: isPrivilegeGranted('reception'),
        },
        {
          title: "Patients to Return",
          icon: <PatientsToReturnIcon />,
          to: "/reception/to-return/patients",
          badge: notifications && typeof notifications.patients_to_return !== 'undefined' && notifications.patients_to_return != null ? (Number(notifications.patients_to_return) || 0) : 0,
          show: isPrivilegeGranted('reception'),
        },
        {
          title: "Sent Messages",
          icon: <MessageIcon />,
          to: "/reception/sent-messages",
          show: isPrivilegeGranted('reception'),
        },
        {
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/reception/reports",
          show: isPrivilegeGranted('reception'),
          items: [
            {
              title: "Patient Registration Report",
              icon: <ReportsIcon />,
              to: "/reception/reports/patient-registration",
              show: isPrivilegeGranted('reception'),
            },
          ],
        },
        {
          title: "Website Appointments",
          icon: <AppointmentsIcon />,
          to: "/external-links/website-appointments",
          badge: notifications && typeof notifications.website_appointments !== 'undefined' && notifications.website_appointments != null ? (Number(notifications.website_appointments) || 0) : (loading ? '...' : 0),
          show: isPrivilegeGranted('reception'),
        },
        {
          title: "2. CASHIER",
          subheader: true,
          show: isPrivilegeGranted('payment_center'),
        },
        {
          title: "Cashier Dashboard",
          icon: <HomeIcon />,
          to: "/payment-center/dashboard",
          show: isPrivilegeGranted('payment_center'),
        },
        {
          title: "Patients Sent to Cashier",
          icon: <WaitingIcon />,
          to: "/payment-center/pending-cash-patients",
          badge: notifications && typeof notifications.patients_sent_to_cashier !== 'undefined' && notifications.patients_sent_to_cashier != null ? (Number(notifications.patients_sent_to_cashier) || 0) : (loading ? '...' : 0),
          show: isPrivilegeGranted('payment_center'),
        },
        {
          title: "Credit Patients Approval",
          icon: <WaitingIcon />,
          to: "/payment-center/pending-credit-patients",
          badge: notifications && typeof notifications.credit_patients_approval !== 'undefined' && notifications.credit_patients_approval != null ? (Number(notifications.credit_patients_approval) || 0) : 0,
          show: isPrivilegeGranted('payment_center'),
        },
        {
          title: "Pending Patient Bills",
          icon: <WaitingIcon />,
          to: "/payment-center/patient-bills/pending",
          show: isPrivilegeGranted('payment_center'),
        },
        {
          title: "Cleared Patient Bills",
          icon: <DoneIcon />,
          to: "/payment-center/patient-bills/cleared",
          show: isPrivilegeGranted('payment_center'),
        },
        {
          title: "Invoices",
          icon: <ReceiptIcon />,
          to: "/payment-center/invoices",
          show: isPrivilegeGranted('payment_center'),
        },
        {
          title: "Expenses",
          icon: <ExpensesIcon />,
          to: "/payment-center/expenses",
          show: isPrivilegeGranted('payment_center'),
        },
        {
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/payment-center/reports",
          show: isPrivilegeGranted('payment_center'),
          items: [
            {
              title: "Daily Credit Collection Report",
              icon: <ReportsIcon />,
              to: "/payment-center/reports/daily-credit-collection",
              show: isPrivilegeGranted('payment_center'),
            },
            {
              title: "Expenses Report",
              icon: <ReportsIcon />,
              to: "/payment-center/reports/expenses",
              show: isPrivilegeGranted('payment_center'),
            },
          ],
        },
        {
          title: "3. CONSULTATION ROOM",
          subheader: true,
          show: isPrivilegeGranted('consultation_room'),
        },
        {
          title: "Consultation Room Dashboard",
          icon: <HomeIcon />,
          to: "/consultation-room/dashboard",
          show: isPrivilegeGranted('consultation_room'),
        },
        {
          title: "Patients Sent to Doctor",
          icon: <WaitingIcon />,
          to: "/consultation-room/consultation-patients/pending",
          badge: notifications && typeof notifications.patients_sent_to_doctor !== 'undefined' && notifications.patients_sent_to_doctor != null ? (Number(notifications.patients_sent_to_doctor) || 0) : 0,
          show: isPrivilegeGranted('consultation_room'),
        },
        {
          title: "Consulted Patients",
          icon: <DoneIcon />,
          to: "/consultation-room/consultation-patients/consulted",
          show: isPrivilegeGranted('consultation_room'),
        },
        {
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/consultation-room/reports",
          show: isPrivilegeGranted('consultation_room'),
          items: [
            {
              title: "Consultation Report",
              icon: <ReportsIcon />,
              to: "/consultation-room/reports/consultation",
              show: isPrivilegeGranted('consultation_room'),
            },
            {
              title: "Monthly Optometrist Report",
              icon: <ReportsIcon />,
              to: "/consultation-room/reports/optometrist-monthly-report",
              show: false, // Hidden per user request
            },
            {
              title: "Pharmacy & Consultation Report",
              icon: <ReportsIcon />,
              to: "/consultation-room/reports/pharmacy-consultation-report",
              show: isPrivilegeGranted('consultation_room') || isPrivilegeGranted('medicine_center'),
            },
          ],
        },
        {
          title: "4. SALES TABLE",
          subheader: true,
          show: hasSalesCenterAccess,
        },
        {
          title: "Sales Management Dashboard",
          icon: <HomeIcon />,
          to: "/sales-management/dashboard",
          show: hasSalesCenterAccess,
        },
        {
          title: "Client Lists",
          icon: <PeopleIcon />,
          to: "/sales-management/clients",
          show: hasSalesCenterAccess,
        },
        {
          title: "Prescriptions Without Purchases",
          icon: <PrescriptionIcon />,
          to: "/sales-management/prescriptions",
          show: hasSalesCenterAccess,
        },
        {
          title: "Patients Sent to Sales",
          icon: <PrescriptionIcon />,
          to: "/sales-management/clinical-notes",
          show: hasSalesCenterAccess,
          badge: notifications && typeof notifications.patients_sent_to_sales !== 'undefined' && notifications.patients_sent_to_sales != null ? (Number(notifications.patients_sent_to_sales) || 0) : 0,
        },
        {
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/sales-management/reports",
          show: hasSalesCenterAccess,
          items: [
            {
              title: "Sales Manager Monthly Report",
              icon: <ReportsIcon />,
              to: "/sales-center/reports/sales-manager-monthly-report",
              show: false, // Hidden per user request
            },
            {
              title: "Sales Monthly Report",
              icon: <ReportsIcon />,
              to: "/sales-center/reports/sales-monthly-report",
              show: hasSalesCenterAccess,
            },
            {
              title: "Customer Relationship Monthly Report",
              icon: <ReportsIcon />,
              to: "/sales-center/reports/customer-relationship-monthly-report",
              show: false, // Hidden per user request
            },
          ],
        },
        {
          title: "5. PHARMACY",
          subheader: true,
          show: isPrivilegeGranted('medicine_center'),
        },
        {
          title: "Pharmacy Dashboard",
          icon: <HomeIcon />,
          to: "/pharmacy/dashboard",
          show: isPrivilegeGranted('medicine_center'),
        },
        {
          title: "Medicine Alerts",
          icon: <WarningIcon />,
          to: "/pharmacy/medicine-alerts",
          show: isPrivilegeGranted('medicine_center'),
        },
        {
          title: "Medicine Taking",
          icon: <MedicineIcon />,
          to: "/pharmacy/medicine-taking",
          show: isPrivilegeGranted('medicine_center'),
        },
        {
          title: "Medicine Dispensing Requests",
          icon: <WaitingIcon />,
          to: "/pharmacy/dispensing-requests",
          badge: notifications && typeof notifications.dispensing_requests !== 'undefined' && notifications.dispensing_requests != null ? (Number(notifications.dispensing_requests) || 0) : 0,
          show: isPrivilegeGranted('medicine_center'),
        },
        {
          title: "Pharmacy Reports",
          icon: <ReportsIcon />,
          to: "/pharmacy/reports",
          show: isPrivilegeGranted('medicine_center'),
          items: [
            {
              title: "Stock Management",
              icon: <ReportsIcon />,
              to: "/pharmacy/reports/stock-management",
              show: isPrivilegeGranted('medicine_center'),
              items: [
                {
                  title: "Item Balance Report",
                  icon: <ReportsIcon />,
                  to: "/pharmacy/reports/stock-management/item-balance",
                  show: isPrivilegeGranted('medicine_center'),
                },
                {
                  title: "Quantity Dispensed Report",
                  icon: <ReportsIcon />,
                  to: "/pharmacy/reports/stock-management/item-quantity-dispensed",
                  show: isPrivilegeGranted('medicine_center'),
                },
              ],
            },
            {
              title: "Pharmacy Monthly Report",
              icon: <ReportsIcon />,
              to: "/pharmacy/reports/pharmacy-monthly-report",
              show: isPrivilegeGranted('medicine_center'),
            },
          ],
        },
        {
          title: "Dispensing Reports",
          icon: <ReportsIcon />,
          to: "/dispensing/reports",
          show: isPrivilegeGranted('medicine_center'),
          items: [
            {
              title: "Items Dispensed Report",
              icon: <ReportsIcon />,
              to: "/dispensing/reports/items-dispensed",
              show: isPrivilegeGranted('medicine_center'),
            },
            {
              title: "Items Not Dispensed Report",
              icon: <ReportsIcon />,
              to: "/dispensing/reports/items-not-dispensed",
              show: isPrivilegeGranted('medicine_center'),
            },
            {
              title: "Item Balance Report",
              icon: <ReportsIcon />,
              to: "/dispensing/reports/item-balance",
              show: isPrivilegeGranted('medicine_center'),
            },
          ],
        },
        {
          title: "6. WORKSHOP",
          subheader: true,
          show: isPrivilegeGranted('optician_center'),
        },
        {
          title: "Workshop Dashboard",
          icon: <HomeIcon />,
          to: "/optician-center/dashboard",
          show: isPrivilegeGranted('optician_center'),
        },
        {
          title: "Patients Sent to Optician",
          icon: <WaitingIcon />,
          to: "/optician-center/glass-patients",
          badge: notifications && typeof notifications.patients_sent_to_optician !== 'undefined' && notifications.patients_sent_to_optician != null ? (Number(notifications.patients_sent_to_optician) || 0) : 0,
          show: isPrivilegeGranted('optician_center'),
        },
        {
          title: "Lens Stock",
          icon: <ItemsIcon />,
          to: "/optician-center/lens-stock",
          show: isPrivilegeGranted('optician_center'),
        },
        {
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/optician-center/reports",
          show: isPrivilegeGranted('optician_center'),
          items: [
            {
              title: "Items Dispensed Report",
              icon: <ReportsIcon />,
              to: "/optician-center/reports/items-dispensed",
              show: isPrivilegeGranted('optician_center'),
            },
            {
              title: "Items Not Dispensed Report",
              icon: <ReportsIcon />,
              to: "/optician-center/reports/items-not-dispensed",
              show: isPrivilegeGranted('optician_center'),
            },
            {
              title: "Item Balance Report",
              icon: <ReportsIcon />,
              to: "/optician-center/reports/item-balance",
              show: isPrivilegeGranted('optician_center'),
            },
          ],
        },
        {
          title: "Procedure Requests",
          icon: <WaitingIcon />,
          to: "/consultation-room/procedure-requests",
          badge: notifications && typeof notifications.procedure_requests !== 'undefined' && notifications.procedure_requests != null ? (Number(notifications.procedure_requests) || 0) : 0,
          show: isPrivilegeGranted('procedure_room') || isPrivilegeGranted('consultation_room'),
        },
        {
          title: "7. STOCK MANAGEMENT",
          subheader: true,
          show: isPrivilegeGranted('inventory_management'),
        },
        {
          title: "Stock Dashboard",
          icon: <HomeIcon />,
          to: "/inventory-management/dashboard",
          show: isPrivilegeGranted('inventory_management'),
        },
        {
          title: "Stocktaking",
          icon: <ItemsIcon />,
          to: "/inventory-management/stocktaking",
          show: isPrivilegeGranted('inventory_management'),
        },
        {
          title: "Stock Alerts (All Items)",
          icon: <WarningIcon />,
          to: "/inventory-management/stock-alerts",
          show: isPrivilegeGranted('inventory_management'),
        },
        {
          title: "Lens List",
          icon: <ItemsIcon />,
          to: "/inventory-management/lens-list",
          show: isPrivilegeGranted('inventory_management'),
        },
        {
          title: "Lens Tracking",
          icon: <ItemsIcon />,
          to: "/inventory-management/lens-tracking",
          show: isPrivilegeGranted('inventory_management'),
        },
        {
          title: "Medicines",
          icon: <ItemsIcon />,
          to: "/pharmacy/medicines",
          show: isPrivilegeGranted('medicine_center'),
        },
        {
          title: "Add Medicine",
          icon: <AddIcon />,
          to: "/pharmacy/add-medicine",
          show: isPrivilegeGranted('medicine_center'),
        },
        {
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/inventory-management/reports",
          show: isPrivilegeGranted('inventory_management'),
          items: [
            {
              title: "Stock Management",
              icon: <ReportsIcon />,
              to: "/inventory-management/reports/stock-management",
              show: isPrivilegeGranted('inventory_management'),
              items: [
                {
                  title: "Item Balance Report",
                  icon: <ReportsIcon />,
                  to: "/inventory-management/reports/stock-management/item-balance",
                  show: isPrivilegeGranted('inventory_management'),
                },
                {
                  title: "Quantity Dispensed Report",
                  icon: <ReportsIcon />,
                  to: "/inventory-management/reports/stock-management/item-quantity-dispensed",
                  show: isPrivilegeGranted('inventory_management'),
                },
              ],
            },
            {
              title: "Stock Alerts",
              icon: <WarningIcon />,
              to: "/inventory-management/reports/stock-alerts",
              show: isPrivilegeGranted('inventory_management'),
            },
          ],
        },
        {
          title: "8. FINANCIAL MANAGEMENT",
          subheader: true,
          show: hasPrivilege(user, 'financial_management') || isAdmin(user),
        },
        {
          title: "Financial Management Dashboard",
          icon: <HomeIcon />,
          to: "/financial-management/dashboard",
          show: hasPrivilege(user, 'financial_management') || isAdmin(user),
        },
        {
          title: "Expenses",
          icon: <ExpensesIcon />,
          to: "/financial-management/expenses",
          show: hasPrivilege(user, 'financial_management') || isAdmin(user),
        },
        {
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/financial-management/reports",
          show: hasPrivilege(user, 'financial_management') || isAdmin(user),
          items: [
            {
              title: "Cash Collection Report",
              icon: <ReportsIcon />,
              to: "/financial-management/reports/cash-collection",
              show: isPrivilegeGranted('financial_management'),
            },
            {
              title: "Credit Collection Report",
              icon: <ReportsIcon />,
              to: "/financial-management/reports/credit-collection",
              show: isPrivilegeGranted('financial_management'),
            },
            {
              title: "Pending Patient Bills Report",
              icon: <ReportsIcon />,
              to: "/financial-management/reports/pending-patient-bills",
              show: isPrivilegeGranted('financial_management'),
            },
            {
              title: "Cleared Patient Bills Report",
              icon: <ReportsIcon />,
              to: "/financial-management/reports/cleared-patient-bills",
              show: isPrivilegeGranted('financial_management'),
            },
            {
              title: "Bill Payment Report",
              icon: <ReportsIcon />,
              to: "/financial-management/reports/patient-bill-payments",
              show: isPrivilegeGranted('financial_management'),
            },
            {
              title: "Expenses Report",
              icon: <ReportsIcon />,
              to: "/financial-management/reports/expenses",
              show: isPrivilegeGranted('financial_management'),
            },
            {
              title: "Expense Payments Report",
              icon: <ReportsIcon />,
              to: "/financial-management/reports/expense-payments",
              show: isPrivilegeGranted('financial_management'),
            },
            {
              title: "Balance Sheet Report",
              icon: <ReportsIcon />,
              to: "/financial-management/reports/balance-sheet",
              show: isPrivilegeGranted('financial_management'),
            },
          ],
        },
        {
          title: "9. MARKETING MANAGEMENT",
          subheader: true,
          show: true, // Visibility will be determined by generateMenuTree based on visible children
        },
        {
          title: "Marketing Dashboard",
          icon: <HomeIcon />,
          to: "/marketing/dashboard",
          show: isPrivilegeGranted('marketing'),
        },
        {
          title: "High Value Patients",
          icon: <VipIcon />,
          to: "/marketing/high-value-patients",
          show: isPrivilegeGranted('marketing'),
        },
        {
          title: "List of Glass Patients",
          icon: <PeopleIcon />,
          to: "/marketing/glass-patients",
          show: isPrivilegeGranted('marketing'),
        },
        {
          title: "Marketing Strategies",
          icon: <MarketingStrategiesIcon />,
          to: "/marketing/strategies",
          show: isPrivilegeGranted('marketing'),
        },
        {
          title: "Events & Campaigns",
          icon: <OutreachProgrammesIcon />,
          to: "/marketing/events",
          show: isPrivilegeGranted('marketing'),
        },
        {
          title: "Bulk SMS",
          icon: <MessageIcon />,
          to: "/marketing/bulk-sms",
          show: isPrivilegeGranted('marketing'),
        },
        {
          title: "WhatsApp Export",
          icon: <MessageIcon />,
          to: "/marketing/whatsapp-export",
          show: isPrivilegeGranted('marketing'),
        },
        {
          title: "Unreachable Calls",
          icon: <WarningIcon />,
          to: "/marketing/unreachable-numbers",
          show: isPrivilegeGranted('marketing'),
        },
        {
          title: "Prestige Clients",
          icon: <VipIcon />,
          to: "/marketing/prestige-clients",
          badge: notifications && typeof notifications.vip_patients !== 'undefined' && notifications.vip_patients != null ? (Number(notifications.vip_patients) || 0) : 0,
          show: isPrivilegeGranted('marketing'),
        },
        {
          title: "Client Calling Status",
          icon: <CommunicationLogsIcon />,
          to: "/marketing/client-calling-status",
          show: isPrivilegeGranted('marketing'),
        },
        {
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/marketing/reports",
          show: isPrivilegeGranted('marketing'),
          items: [
            {
              title: "Marketing Campaign Performance",
              icon: <ReportsIcon />,
              to: "/marketing/reports/campaign-performance",
              show: isPrivilegeGranted('marketing'),
            },
            {
              title: "Lead Generation Report",
              icon: <ReportsIcon />,
              to: "/marketing/reports/lead-generation",
              show: isPrivilegeGranted('marketing'),
            },
            {
              title: "Communication Analytics",
              icon: <ReportsIcon />,
              to: "/marketing/reports/communication-analytics",
              show: isPrivilegeGranted('marketing'),
            },
            {
              title: "Monthly Marketing & Operations Manager Report",
              icon: <ReportsIcon />,
              to: "/marketing/reports/marketing-operations-monthly-report",
              show: false, // Hidden per user request
            },
            {
              title: "Marketing Management Monthly Report",
              icon: <ReportsIcon />,
              to: "/marketing/reports/marketing-management-monthly-report",
              show: isPrivilegeGranted('marketing'),
            },
          ],
        },
        {
          title: "Settings",
          icon: <SettingsIcon />,
          to: "/marketing/settings",
          show: isPrivilegeGranted('marketing'),
          items: [
            {
              title: "Sources of Information",
              icon: <InfoIcon />,
              to: "/marketing/settings/information-sources",
              show: isPrivilegeGranted('marketing'),
            },
          ],
        },
        {
          title: "10. EMPLOYEE MANAGEMENT",
          subheader: true,
          show: true, // Visibility will be determined by generateMenuTree based on visible children
        },
        {
          title: "Employees",
          icon: <UserManagementIcon />,
          to: "/user-management/users",
          show: isPrivilegeGranted('employee_management'),
        },
        {
         title: "Doctor Tasks",
         icon: <DoctorTaskIcon />,
         to: "/user-management/doctor-tasks",
         show: hasPrivilege(user, 'employee_management') || isAdmin(user),
       },
        {
          title: "11. DIRECTOR",
          subheader: true,
          show: true, // Visibility will be determined by generateMenuTree based on visible children
        },
        {
          title: "Director Dashboard",
          icon: <DirectorIcon />,
          to: "/director/dashboard",
          show: false,
        },
        {
          title: "Employee Performance",
          icon: <PerformanceIcon />,
          to: "/director/employee-performance",
          show: isPrivilegeGranted('director'),
        },
        {
          title: "All Reports",
          icon: <ReportsIcon />,
          to: "/director/reports",
          show: isPrivilegeGranted('director'),
          items: [
            {
              title: "Reception Reports",
              icon: <ReportsIcon />,
              to: "/director/reports/reception",
              show: isPrivilegeGranted('director'),
              items: [
                {
                  title: "Patient Registration Report",
                  icon: <ReportsIcon />,
                  to: "/director/reports/reception/patient-registration",
                  show: isPrivilegeGranted('director'),
                },
              ],
            },
            {
              title: "Payment Center Reports",
              icon: <ReportsIcon />,
              to: "/director/reports/payment-center",
              show: isPrivilegeGranted('director'),
              items: [
                {
                  title: "Daily Cash Collection Report",
                  icon: <ReportsIcon />,
                  to: "/director/reports/payment-center/daily-cash-collection",
                  show: isPrivilegeGranted('director'),
                },
                {
                  title: "Daily Credit Collection Report",
                  icon: <ReportsIcon />,
                  to: "/director/reports/payment-center/daily-credit-collection",
                  show: isPrivilegeGranted('director'),
                },
                {
                  title: "Expenses Report",
                  icon: <ReportsIcon />,
                  to: "/director/reports/payment-center/expenses",
                  show: isPrivilegeGranted('director'),
                },
              ],
            },
            {
              title: "Consultation Room Reports",
              icon: <ReportsIcon />,
              to: "/director/reports/consultation-room",
              show: isPrivilegeGranted('director'),
              items: [
                {
                  title: "Consultation Report",
                  icon: <ReportsIcon />,
                  to: "/director/reports/consultation-room/consultation",
                  show: isPrivilegeGranted('director'),
                },
                {
                  title: "Optometrist Monthly Report",
                  icon: <ReportsIcon />,
                  to: "/director/reports/consultation-room/optometrist-monthly-report",
                  show: isPrivilegeGranted('director'),
                },
              ],
            },
            {
              title: "Sales Center Reports",
              icon: <ReportsIcon />,
              to: "/director/reports/sales-center",
              show: isPrivilegeGranted('director'),
              items: [
                {
                  title: "Sales Report",
                  icon: <ReportsIcon />,
                  to: "/director/reports/sales-center/sales",
                  show: isPrivilegeGranted('director'),
                },
                {
                  title: "Sales Manager Monthly Report",
                  icon: <ReportsIcon />,
                  to: "/director/reports/sales-center/sales-manager-monthly-report",
                  show: isPrivilegeGranted('director'),
                },
              ],
            },
            {
              title: "Financial Management Reports",
              icon: <ReportsIcon />,
              to: "/director/reports/financial-management",
              show: isPrivilegeGranted('director'),
              items: [
                {
                  title: "Cash Collection Report",
                  icon: <ReportsIcon />,
                  to: "/director/reports/financial-management/cash-collection",
                  show: isPrivilegeGranted('director'),
                },
                {
                  title: "Credit Collection Report",
                  icon: <ReportsIcon />,
                  to: "/director/reports/financial-management/credit-collection",
                  show: isPrivilegeGranted('director'),
                },
                {
                  title: "Pending Patient Bills",
                  icon: <ReportsIcon />,
                  to: "/director/reports/financial-management/pending-patient-bills",
                  show: isPrivilegeGranted('director'),
                },
                {
                  title: "Cleared Patient Bills",
                  icon: <ReportsIcon />,
                  to: "/director/reports/financial-management/cleared-patient-bills",
                  show: isPrivilegeGranted('director'),
                },
                {
                  title: "Patient Bill Payments",
                  icon: <ReportsIcon />,
                  to: "/director/reports/financial-management/patient-bill-payments",
                  show: isPrivilegeGranted('director'),
                },
                {
                  title: "Expenses Report",
                  icon: <ReportsIcon />,
                  to: "/director/reports/financial-management/expenses",
                  show: isPrivilegeGranted('director'),
                },
                {
                  title: "Expense Payments",
                  icon: <ReportsIcon />,
                  to: "/director/reports/financial-management/expense-payments",
                  show: isPrivilegeGranted('director'),
                },
                {
                  title: "Balance Sheet",
                  icon: <ReportsIcon />,
                  to: "/director/reports/financial-management/balance-sheet",
                  show: isPrivilegeGranted('director'),
                },
              ],
            },
            {
              title: "Marketing Reports",
              icon: <ReportsIcon />,
              to: "/director/reports/marketing",
              show: isPrivilegeGranted('director'),
              items: [
                {
                  title: "Patient Registration Report",
                  icon: <ReportsIcon />,
                  to: "/director/reports/marketing/patient-registration",
                  show: isPrivilegeGranted('director'),
                },
                {
                  title: "Consultation Report",
                  icon: <ReportsIcon />,
                  to: "/director/reports/marketing/consultation",
                  show: isPrivilegeGranted('director'),
                },
                {
                  title: "Campaign Performance",
                  icon: <ReportsIcon />,
                  to: "/director/reports/marketing/campaign-performance",
                  show: isPrivilegeGranted('director'),
                },
                {
                  title: "Lead Generation",
                  icon: <ReportsIcon />,
                  to: "/director/reports/marketing/lead-generation",
                  show: isPrivilegeGranted('director'),
                },
                {
                  title: "Communication Analytics",
                  icon: <ReportsIcon />,
                  to: "/director/reports/marketing/communication-analytics",
                  show: isPrivilegeGranted('director'),
                },
                {
                  title: "Marketing Operations Monthly Report",
                  icon: <ReportsIcon />,
                  to: "/director/reports/marketing/marketing-operations-monthly-report",
                  show: isPrivilegeGranted('director'),
                },
              ],
            },
            {
              title: "Medicine Center Reports",
              icon: <ReportsIcon />,
              to: "/director/reports/medicine-center",
              show: isPrivilegeGranted('director'),
              items: [
                {
                  title: "Medicines Dispensed",
                  icon: <ReportsIcon />,
                  to: "/director/reports/medicine-center/dispensing/medicines-dispensed",
                  show: isPrivilegeGranted('director'),
                },
                {
                  title: "Medicines Not Dispensed",
                  icon: <ReportsIcon />,
                  to: "/director/reports/medicine-center/dispensing/medicines-not-dispensed",
                  show: isPrivilegeGranted('director'),
                },
                {
                  title: "Item Balance",
                  icon: <ReportsIcon />,
                  to: "/director/reports/medicine-center/stock-management/item-balance",
                  show: isPrivilegeGranted('director'),
                },
                {
                  title: "Item Quantity Dispensed",
                  icon: <ReportsIcon />,
                  to: "/director/reports/medicine-center/stock-management/item-quantity-dispensed",
                  show: isPrivilegeGranted('director'),
                },
                {
                  title: "Medicine Alerts",
                  icon: <ReportsIcon />,
                  to: "/director/reports/medicine-center/medicine-alerts",
                  show: isPrivilegeGranted('director'),
                },
              ],
            },
            {
              title: "Stock Management Reports",
              icon: <ReportsIcon />,
              to: "/director/reports/inventory-management",
              show: isPrivilegeGranted('director'),
              items: [
                {
                  title: "Item Balance Report",
                  icon: <ReportsIcon />,
                  to: "/director/reports/inventory-management/stock-management/item-balance",
                  show: isPrivilegeGranted('director'),
                },
                {
                  title: "Quantity Dispensed Report",
                  icon: <ReportsIcon />,
                  to: "/director/reports/inventory-management/stock-management/item-quantity-dispensed",
                  show: isPrivilegeGranted('director'),
                },
                {
                  title: "Stock Alerts",
                  icon: <ReportsIcon />,
                  to: "/director/reports/inventory-management/stock-alerts",
                  show: isPrivilegeGranted('director'),
                },
              ],
            },
            {
              title: "Dispensing Reports",
              icon: <ReportsIcon />,
              to: "/director/reports/dispensing",
              show: isPrivilegeGranted('director'),
              items: [
                {
                  title: "Items Dispensed",
                  icon: <ReportsIcon />,
                  to: "/director/reports/dispensing/items-dispensed",
                  show: isPrivilegeGranted('director'),
                },
                {
                  title: "Items Not Dispensed",
                  icon: <ReportsIcon />,
                  to: "/director/reports/dispensing/items-not-dispensed",
                  show: isPrivilegeGranted('director'),
                },
                {
                  title: "Item Balance",
                  icon: <ReportsIcon />,
                  to: "/director/reports/dispensing/item-balance",
                  show: isPrivilegeGranted('director'),
                },
              ],
            },
            {
              title: "Optician Center Reports",
              icon: <ReportsIcon />,
              to: "/director/reports/optician-center",
              show: isPrivilegeGranted('director'),
              items: [
                {
                  title: "Items Dispensed",
                  icon: <ReportsIcon />,
                  to: "/director/reports/optician-center/items-dispensed",
                  show: isPrivilegeGranted('director'),
                },
                {
                  title: "Items Not Dispensed",
                  icon: <ReportsIcon />,
                  to: "/director/reports/optician-center/items-not-dispensed",
                  show: isPrivilegeGranted('director'),
                },
                {
                  title: "Item Balance",
                  icon: <ReportsIcon />,
                  to: "/director/reports/optician-center/item-balance",
                  show: isPrivilegeGranted('director'),
                },
              ],
            },
          ],
        },
        {
          title: "Calendar",
          icon: <AppointmentsIcon />,
          to: "/office-calendar",
          show: true,
        },
        {
          title: "12. SETTINGS",
          subheader: true,
          show: hasPrivilege(user, 'settings') || isAdmin(user),
        },
        {
          title: "Item Management",
          icon: <ItemsIcon />,
          to: "/settings/item-management",
          show: hasPrivilege(user, 'settings') || isAdmin(user),
          items: [
            {
              title: "Units of Measure",
              icon: <SettingsIcon />,
              to: "/settings/item-management/units-of-measure",
              show: hasPrivilege(user, 'settings') || isAdmin(user),
            },
            {
              title: "Lens Types",
              icon: <SettingsIcon />,
              to: "/settings/item-management/lens-types",
              show: hasPrivilege(user, 'settings') || isAdmin(user),
            },
            {
              title: "Item Types",
              icon: <SettingsIcon />,
              to: "/settings/item-management/item-types",
              show: hasPrivilege(user, 'settings') || isAdmin(user),
            },
            {
              title: "Consultation Types",
              icon: <SettingsIcon />,
              to: "/settings/item-management/consultation-types",
              show: hasPrivilege(user, 'settings') || isAdmin(user),
            },
            {
              title: "Items",
              icon: <SettingsIcon />,
              to: "/settings/item-management/items",
              show: hasPrivilege(user, 'settings') || isAdmin(user),
            },
          ],
        },
        {
          title: "Payment Modes",
          icon: <PaymentModesIcon />,
          to: "/settings/payment-modes",
          show: hasPrivilege(user, 'settings') || isAdmin(user),
        },
        {
          title: "Payment Channels",
          icon: <PaymentChannelsIcon />,
          to: "/settings/payment-channels",
          show: hasPrivilege(user, 'settings') || isAdmin(user),
        },
        {
          title: "Diseases",
          icon: <DiseasesIcon />,
          to: "/settings/diseases",
          show: hasPrivilege(user, 'settings') || isAdmin(user),
        },
        {
          title: "Expense Categories",
          icon: <ExpensesIcon />,
          to: "/settings/expense-categories",
          show: hasPrivilege(user, 'settings') || isAdmin(user),
        },
        {
          title: "Departments",
          icon: <DepartmentsIcon />,
          to: "/settings/departments",
          show: hasPrivilege(user, 'settings') || isAdmin(user),
        },
        {
          title: "Job Titles",
          icon: <JobTitlesIcon />,
          to: "/settings/job-titles",
          show: hasPrivilege(user, 'settings') || isAdmin(user),
        },
        {
          title: "Occupations",
          icon: <JobTitlesIcon />,
          to: "/settings/occupations",
          show: hasPrivilege(user, 'settings') || isAdmin(user),
        },
        {
          title: "Clinic Details",
          icon: <ClinicDetailsIcon />,
          to: "/settings/clinic-details",
          show: hasPrivilege(user, 'settings') || isAdmin(user),
        },
        {
          title: "System Preferences",
          icon: <SettingsIcon />,
          to: "/settings/preferences",
          show: hasPrivilege(user, 'settings') || isAdmin(user),
        },
        {
          title: "Clinics",
          icon: <ClinicsIcon />,
          to: "/settings/clinics",
          show: (hasPrivilege(user, 'settings') || isAdmin(user)) && isAdmin(user),
        },
      ]));
      
      // Debug: Log visible menu items
      const visibleItems = items.filter(item => item.show !== false);
      const hiddenItems = items.filter(item => item.show === false);
      console.log('[Menu] Menu items summary:', {
        total: items.length,
        visible: visibleItems.length,
        hidden: hiddenItems.length,
        visibleSections: visibleItems.filter(i => i.subheader).map(i => i.title),
        hiddenSections: hiddenItems.filter(i => i.subheader).map(i => i.title)
      });
    } else {
      console.log('[Menu] No user object, menu items cleared');
      setItems([]);
    }
  }, [user, notifications]);

  const generateMenuTree = (items) => {
    if (!items) return null;

    // First, identify which section headers should be shown based on visible children
    const sectionVisibility = new Map();
    
    // Helper function to recursively check if an item or any of its children are visible
    const hasVisibleContent = (item) => {
      // Check if the item itself is visible
      if (typeof item.show === "boolean" && item.show) {
        return true;
      }
      // Check nested items recursively
      if (item.items && Array.isArray(item.items)) {
        return item.items.some(nestedItem => hasVisibleContent(nestedItem));
      }
      return false;
    };
    
    items.forEach((item, index) => {
      if (item.subheader && item.title !== "MENU") {
        // Find all items that belong to this section (items after this subheader until next subheader)
        const sectionItems = [];
        for (let i = index + 1; i < items.length; i++) {
          const nextItem = items[i];
          if (nextItem.subheader) {
            // Reached next section, stop
            break;
          }
          sectionItems.push(nextItem);
        }
        
        // Check if any item in this section is visible (including nested items)
        const hasVisibleItems = sectionItems.some(sectionItem => hasVisibleContent(sectionItem));
        
        sectionVisibility.set(index, hasVisibleItems);
      }
    });

    // Filter items based on show property
    const filteredItems = items.filter((e, index) => {
      // For section headers, check if they have visible children
      if (e.subheader) {
        if (e.title === "MENU") {
          return true; // Always show the main MENU header
        }
        // Check if this section has any visible items
        return sectionVisibility.get(index) === true;
      }
      // For regular items, check the show property
      return typeof e.show === "boolean" && e.show;
    });

    return filteredItems.map((e, index) => {
      const hasChildren = e.items?.filter(
        (child) => typeof child.show === "boolean" && child.show
      )?.length;
      // Generate unique key: use title + route combination to ensure uniqueness
      const uniqueKey = e.subheader 
        ? `subheader-${e.title}-${index}` 
        : `${e.title}-${e.to || index}-${index}`;
      return hasChildren ? (
        <MultiLevelMenuItem
          key={uniqueKey}
          item={e}
          location={location}
          generateMenuTree={generateMenuTree}
        />
      ) : (
        <SingleLevelMenuItem
          key={uniqueKey}
          item={e}
          setDrawerOpen={setDrawerOpen}
          location={location}
          navigate={navigate}
        />
      );
    });
  };

  return (
    <Box
      sx={{
        height: "100%",
        overflowY: "scroll", // Always show scrollbar
        overflowX: "hidden",
        "&::-webkit-scrollbar": {
          width: "10px", // Slightly wider
        },
        "&::-webkit-scrollbar-track": {
           background: "rgba(0,0,0,0.05)" // Visible track
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "#888", // Darker visible thumb
          borderRadius: "4px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          backgroundColor: "#555",
        },
      }}
    >
      <List
        component="nav"
        dense
        disablePadding
        {...rest}
      >
        {generateMenuTree(items)}
      </List>
    </Box>
  );
};

export default Menu;