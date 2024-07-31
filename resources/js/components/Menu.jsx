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

import {
  BadgeRounded as JobTitlesIcon,
  ContactsRounded as ClinicDetailsIcon,
  DoneAllRounded as DoneIcon,
  ExpandLessRounded as ExpandLessIcon,
  ExpandMoreRounded as ExpandMoreIcon,
  EventNoteRounded as AppointmentsIcon,
  GroupRounded as PeopleIcon,
  HomeRounded as HomeIcon,
  HourglassBottomRounded as WaitingIcon,
  InfoRounded as InfoIcon,
  Inventory2Rounded as ItemsIcon,
  LightbulbRounded as IdeaDevelopmentIcon,
  LibraryBooksRounded as ReportsIcon,
  LocalActivityRounded as OutreachProgrammesIcon,
  LocalHospitalRounded as ClinicsIcon,
  LocationSearchingRounded as MarketResearchIcon,
  ManageAccountsRounded as UserManagementIcon,
  MessageRounded as MessageIcon,
  MoneyRounded as PaymentModesIcon,
  PaymentRounded as PaymentChannelsIcon,
  PestControlRounded as DiseasesIcon,
  PhoneInTalkRounded as CommunicationLogsIcon,
  ScheduleRounded as PatientsToReturnIcon,
  SendRounded as MarketingStrategiesIcon,
  SettingsRounded as SettingsIcon,
  TaskRounded as DailyActivitiesIcon,
  TrendingDownRounded as ExpensesIcon,
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
    <ListSubheader sx={{ px: { xs: 1, sm: 1, md: 1.5 } }}>
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
        "&:hover, &.Mui-selected, &.Mui-selected:hover": {
          color: "primary.main",

          "& .MuiListItemIcon-root": {
            color: "inherit",
          },
        },
        "&.Mui-selected, &.Mui-selected:hover": {
          borderRight: (theme) => `4px solid ${theme.palette.primary.main}`,
        },
        px: { xs: 1, sm: 1, md: 1.5 },
      }}
    >
      {item.icon ? (
        <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
      ) : null}
      <ListItemText primary={item.title} />
      {item.badge ? (
        <Box
          ml={1}
          bgcolor="error.main"
          borderRadius={2}
          px={1}
        >
          <Typography
            color="error.contrastText"
            variant="caption"
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
          "&:hover, &.Mui-selected, &.Mui-selected:hover": {
            color: "primary.main",

            "& .MuiListItemIcon-root": {
              color: "inherit",
            },
          },
          "&.Mui-selected, &.Mui-selected:hover": {
            borderRight: (theme) => `4px solid ${theme.palette.primary.main}`,
          },
          px: { xs: 1, sm: 1, md: 1.5 },
        }}
      >
        {item.icon ? (
          <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
        ) : null}
        <ListItemText primary={item.title} />
        {item.badge ? (
          <Box
            ml={1.5}
            bgcolor="error.main"
            borderRadius={2}
            px={1}
          >
            <Typography
              color="error.contrastText"
              variant="caption"
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

const Menu = ({ drawerOpen, setDrawerOpen, user, notifications, ...rest }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);

  useEffect(() => {
    if (user) {
      setItems([
        {
          title: "MENU",
          subheader: true,
          show: true,
        },
        {
          title: "Dashboard",
          icon: <HomeIcon />,
          to: "/dashboard",
          show: true,
        },
        {
          title: "Patient Records",
          icon: <ReportsIcon />,
          to: "/patient-records/patients",
          show: true,
        },
        {
          title: "RECEPTION",
          subheader: true,
          show: user.privileges.reception,
        },
        {
          title: "Patients/Customers",
          icon: <PeopleIcon />,
          to: "/reception/patients",
          show: user.privileges.reception,
        },
        {
          title: "Spectacle Patients",
          icon: <GlassPatientsIcon />,
          to: "/reception/glass-patients",
          badge: notifications?.glass_patients,
          show: user.privileges.reception,
        },
        {
          title: "Patients to Return",
          icon: <PatientsToReturnIcon />,
          to: "/reception/to-return/patients",
          badge: notifications?.patients_to_return,
          show: user.privileges.reception,
        },
        {
          title: "Sent Messages",
          icon: <MessageIcon />,
          to: "/reception/sent-messages",
          show: user.privileges.reception,
        },
        {
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/reception/reports",
          show: user.privileges.reception,
          items: [
            {
              title: "Patient Registration Report",
              icon: <ReportsIcon />,
              to: "/reception/reports/patient-registration",
              show: user.privileges.reception,
            },
          ],
        },
        {
          title: "PAYMENT CENTER",
          subheader: true,
          show: user.privileges.payment_center,
        },
        {
          title: "Patients Sent to Cashier",
          icon: <WaitingIcon />,
          to: "/payment-center/pending-cash-patients",
          badge: notifications?.patients_sent_to_cashier,
          show: user.privileges.payment_center,
        },
        {
          title: "Credit Patients Approval",
          icon: <WaitingIcon />,
          to: "/payment-center/pending-credit-patients",
          badge: notifications?.credit_patients_approval,
          show: user.privileges.payment_center,
        },
        {
          title: "Pending Patient Bills",
          icon: <WaitingIcon />,
          to: "/payment-center/patient-bills/pending",
          show: user.privileges.payment_center,
        },
        {
          title: "Cleared Patient Bills",
          icon: <DoneIcon />,
          to: "/payment-center/patient-bills/cleared",
          show: user.privileges.payment_center,
        },
        {
          title: "Expenses",
          icon: <ExpensesIcon />,
          to: "/payment-center/expenses",
          show: user.privileges.payment_center,
        },
        {
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/payment-center/reports",
          show: user.privileges.payment_center,
          items: [
            {
              title: "Daily Cash Collection Report",
              icon: <ReportsIcon />,
              to: "/payment-center/reports/daily-cash-collection",
              show: user.privileges.payment_center,
            },
            {
              title: "Daily Credit Collection Report",
              icon: <ReportsIcon />,
              to: "/payment-center/reports/daily-credit-collection",
              show: user.privileges.payment_center,
            },
            {
              title: "Expenses Report",
              icon: <ReportsIcon />,
              to: "/payment-center/reports/expenses",
              show: user.privileges.payment_center,
            },
          ],
        },
        {
          title: "CONSULTATION ROOM",
          subheader: true,
          show: user.privileges.consultation_room,
        },
        {
          title: "Patients Sent to Doctor",
          icon: <WaitingIcon />,
          to: "/consultation-room/consultation-patients/pending",
          badge: notifications?.patients_sent_to_doctor,
          show: user.privileges.consultation_room,
        },
        {
          title: "Consulted Patients",
          icon: <DoneIcon />,
          to: "/consultation-room/consultation-patients/consulted",
          show: user.privileges.consultation_room,
        },
        {
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/consultation-room/reports",
          show: user.privileges.consultation_room,
          items: [
            {
              title: "Consultation Report",
              icon: <ReportsIcon />,
              to: "/consultation-room/reports/consultation",
              show: user.privileges.consultation_room,
            },
          ],
        },
        {
          title: "OPTICIAN CENTER",
          subheader: true,
          show: user.privileges.optician_center,
        },
        {
          title: "Patients Sent to Optician",
          icon: <WaitingIcon />,
          to: "/optician-center/glass-patients",
          badge: notifications?.patients_sent_to_optician,
          show: user.privileges.optician_center,
        },
        {
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/optician-center/reports",
          show: user.privileges.optician_center,
          items: [
            {
              title: "Items Dispensed Report",
              icon: <ReportsIcon />,
              to: "/optician-center/reports/items-dispensed",
              show: user.privileges.optician_center,
            },
            {
              title: "Items Not Dispensed Report",
              icon: <ReportsIcon />,
              to: "/optician-center/reports/items-not-dispensed",
              show: user.privileges.optician_center,
            },
            {
              title: "Item Balance Report",
              icon: <ReportsIcon />,
              to: "/optician-center/reports/item-balance",
              show: user.privileges.optician_center,
            },
          ],
        },
        {
          title: "MEDICINE CENTER",
          subheader: true,
          show: user.privileges.medicine_center,
        },
        {
          title: "Dispensing Requests",
          icon: <WaitingIcon />,
          to: "/medicine-center/dispensing-requests",
          badge: notifications?.dispensing_requests,
          show: user.privileges.medicine_center,
        },
        {
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/medicine-center/reports",
          show: user.privileges.medicine_center,
          items: [
            {
              title: "Medicines Dispensed Report",
              icon: <ReportsIcon />,
              to: "/medicine-center/reports/medicines-dispensed",
              show: user.privileges.medicine_center,
            },
            {
              title: "Medicines Not Dispensed Report",
              icon: <ReportsIcon />,
              to: "/medicine-center/reports/medicines-not-dispensed",
              show: user.privileges.medicine_center,
            },
            {
              title: "Item Balance Report",
              icon: <ReportsIcon />,
              to: "/medicine-center/reports/item-balance",
              show: user.privileges.medicine_center,
            },
          ],
        },
        {
          title: "PROCEDURE ROOM",
          subheader: true,
          show: user.privileges.procedure_room,
        },
        {
          title: "Procedure Requests",
          icon: <WaitingIcon />,
          to: "/procedure-room/procedure-requests",
          badge: notifications?.procedure_requests,
          show: user.privileges.procedure_room,
        },
        {
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/procedure-room/reports",
          show: user.privileges.procedure_room,
          items: [
            {
              title: "Served Procedures Report",
              icon: <ReportsIcon />,
              to: "/procedure-room/reports/served-procedures",
              show: user.privileges.procedure_room,
            },
            {
              title: "Pending Procedures Report",
              icon: <ReportsIcon />,
              to: "/procedure-room/reports/pending-procedures",
              show: user.privileges.procedure_room,
            },
          ],
        },
        {
          title: "OTHER DISPENSING",
          subheader: true,
          show: user.privileges.other_dispensing,
        },
        {
          title: "Dispensing Requests",
          icon: <WaitingIcon />,
          to: "/other-dispensing/dispensing-requests",
          badge: notifications?.other_dispensing_requests,
          show: user.privileges.other_dispensing,
        },
        {
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/other-dispensing/reports",
          show: user.privileges.other_dispensing,
          items: [
            {
              title: "Items Dispensed Report",
              icon: <ReportsIcon />,
              to: "/other-dispensing/reports/items-dispensed",
              show: user.privileges.other_dispensing,
            },
            {
              title: "Items Not Dispensed Report",
              icon: <ReportsIcon />,
              to: "/other-dispensing/reports/items-not-dispensed",
              show: user.privileges.other_dispensing,
            },
            {
              title: "Item Balance Report",
              icon: <ReportsIcon />,
              to: "/other-dispensing/reports/item-balance",
              show: user.privileges.other_dispensing,
            },
          ],
        },
        {
          title: "INVENTORY MANAGEMENT",
          subheader: true,
          show: user.privileges.inventory_management,
        },
        {
          title: "Stocktaking",
          icon: <ItemsIcon />,
          to: "/inventory-management/stocktaking",
          show: user.privileges.inventory_management,
        },
        {
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/inventory-management/reports",
          show: user.privileges.inventory_management,
          items: [
            {
              title: "Item Balance Report",
              icon: <ReportsIcon />,
              to: "/inventory-management/reports/item-balance",
              show: user.privileges.inventory_management,
            },
            {
              title: "Quantity Dispensed Report",
              icon: <ReportsIcon />,
              to: "/inventory-management/reports/item-quantity-dispensed",
              show: user.privileges.inventory_management,
            },
          ],
        },
        {
          title: "MARKETING MANAGEMENT",
          subheader: true,
          show: user.privileges.marketing,
        },
        {
          title: "Marketing Dashboard",
          icon: <HomeIcon />,
          to: "/marketing/dashboard",
          show: user.privileges.marketing,
        },
        {
          title: "Daily Acitivities",
          icon: <DailyActivitiesIcon />,
          to: "/marketing/daily-activities",
          show: user.privileges.marketing,
        },
        {
          title: "Idea Development",
          icon: <IdeaDevelopmentIcon />,
          to: "/marketing/idea-development",
          show: user.privileges.marketing,
        },
        {
          title: "Market Research Plans",
          icon: <MarketResearchIcon />,
          to: "/marketing/research-plans",
          show: user.privileges.marketing,
        },
        {
          title: "Marketing Strategies",
          icon: <MarketingStrategiesIcon />,
          to: "/marketing/strategies",
          show: user.privileges.marketing,
        },
        {
          title: "Appointments",
          icon: <AppointmentsIcon />,
          to: "/marketing/appointments",
          show: user.privileges.marketing,
        },
        {
          title: "Outreach Programmes",
          icon: <OutreachProgrammesIcon />,
          to: "/marketing/outreach-programmes",
          show: user.privileges.marketing,
        },
        {
          title: "Communication Logs",
          icon: <CommunicationLogsIcon />,
          to: "/marketing/communication-logs",
          show: user.privileges.marketing,
        },
        {
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/marketing/reports",
          show: user.privileges.marketing,
          items: [
            {
              title: "Patient Registration Report",
              icon: <ReportsIcon />,
              to: "/marketing/reports/patient-registration",
              show: user.privileges.marketing,
            },
            {
              title: "Consultation Report",
              icon: <ReportsIcon />,
              to: "/marketing/reports/consultation",
              show: user.privileges.marketing,
            },
          ],
        },
        {
          title: "Settings",
          icon: <SettingsIcon />,
          to: "/marketing/settings",
          show: user.privileges.marketing,
          items: [
            {
              title: "Sources of Information",
              icon: <InfoIcon />,
              to: "/marketing/settings/information-sources",
              show: user.privileges.marketing,
            },
          ],
        },
        {
          title: "FINANCIAL MANAGEMENT",
          subheader: true,
          show: user.privileges.financial_management,
        },
        {
          title: "Expenses",
          icon: <ExpensesIcon />,
          to: "/financial-management/expenses",
          show: user.privileges.financial_management,
        },
        {
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/financial-management/reports",
          show: user.privileges.financial_management,
          items: [
            {
              title: "Cash Collection Report",
              icon: <ReportsIcon />,
              to: "/financial-management/reports/cash-collection",
              show: user.privileges.financial_management,
            },
            {
              title: "Credit Collection Report",
              icon: <ReportsIcon />,
              to: "/financial-management/reports/credit-collection",
              show: user.privileges.financial_management,
            },
            {
              title: "Pending Patient Bills Report",
              icon: <ReportsIcon />,
              to: "/financial-management/reports/pending-patient-bills",
              show: user.privileges.financial_management,
            },
            {
              title: "Cleared Patient Bills Report",
              icon: <ReportsIcon />,
              to: "/financial-management/reports/cleared-patient-bills",
              show: user.privileges.financial_management,
            },
            {
              title: "Bill Payment Report",
              icon: <ReportsIcon />,
              to: "/financial-management/reports/patient-bill-payments",
              show: user.privileges.financial_management,
            },
            {
              title: "Expenses Report",
              icon: <ReportsIcon />,
              to: "/financial-management/reports/expenses",
              show: user.privileges.financial_management,
            },
            {
              title: "Expense Payments Report",
              icon: <ReportsIcon />,
              to: "/financial-management/reports/expense-payments",
              show: user.privileges.financial_management,
            },
          ],
        },
        {
          title: "USER MANAGEMENT",
          subheader: true,
          show: user.privileges.user_management,
        },
        {
          title: "Users",
          icon: <UserManagementIcon />,
          to: "/user-management/users",
          show: user.privileges.user_management,
        },
        {
          title: "SETTINGS",
          subheader: true,
          show: user.privileges.settings,
        },
        {
          title: "Item Management",
          icon: <ItemsIcon />,
          to: "/settings/item-management",
          show: user.privileges.settings,
          items: [
            {
              title: "Units of Measure",
              icon: <SettingsIcon />,
              to: "/settings/item-management/units-of-measure",
              show: user.privileges.settings,
            },
            {
              title: "Lens Types",
              icon: <SettingsIcon />,
              to: "/settings/item-management/lens-types",
              show: user.privileges.settings,
            },
            {
              title: "Items",
              icon: <SettingsIcon />,
              to: "/settings/item-management/items",
              show: user.privileges.settings,
            },
          ],
        },
        {
          title: "Payment Modes",
          icon: <PaymentModesIcon />,
          to: "/settings/payment-modes",
          show: user.privileges.settings,
        },
        {
          title: "Payment Channels",
          icon: <PaymentChannelsIcon />,
          to: "/settings/payment-channels",
          show: user.privileges.settings,
        },
        {
          title: "Diseases",
          icon: <DiseasesIcon />,
          to: "/settings/diseases",
          show: user.privileges.settings,
        },
        {
          title: "Expense Categories",
          icon: <ExpensesIcon />,
          to: "/settings/expense-categories",
          show: user.privileges.settings,
        },
        {
          title: "Departments",
          icon: <DepartmentsIcon />,
          to: "/settings/departments",
          show: user.privileges.settings,
        },
        {
          title: "Job Titles",
          icon: <JobTitlesIcon />,
          to: "/settings/job-titles",
          show: user.privileges.settings,
        },
        {
          title: "Clinic Details",
          icon: <ClinicDetailsIcon />,
          to: "/settings/clinic-details",
          show: user.privileges.settings,
        },
        {
          title: "System Preferences",
          icon: <SettingsIcon />,
          to: "/settings/preferences",
          show: user.privileges.settings,
        },
        {
          title: "Clinics",
          icon: <ClinicsIcon />,
          to: "/settings/clinics",
          show: user.privileges.settings && user.role === "Admin",
        },
      ]);
    } else {
      setItems([]);
    }
  }, [user, notifications]);

  const generateMenuTree = (items) => {
    if (!items) return null;

    return items
      .filter((e) => typeof e.show === "boolean" && e.show)
      .map((e) => {
        const hasChildren = e.items?.filter(
          (e) => typeof e.show === "boolean" && e.show
        )?.length;
        return hasChildren ? (
          <MultiLevelMenuItem
            key={e.to}
            item={e}
            location={location}
            generateMenuTree={generateMenuTree}
          />
        ) : (
          <SingleLevelMenuItem
            key={e.subheader ? e.title : e.to}
            item={e}
            setDrawerOpen={setDrawerOpen}
            location={location}
            navigate={navigate}
          />
        );
      });
  };

  return (
    <List
      component="nav"
      dense
      disablePadding
      {...rest}
    >
      {generateMenuTree(items)}
    </List>
  );
};

export default Menu;
