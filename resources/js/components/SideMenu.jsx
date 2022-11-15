import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Collapse, List, ListItemButton, ListItemIcon, ListItemText, ListSubheader } from "@mui/material";
import { alpha } from "@mui/material/styles";

import {
  BadgeRounded as JobTitlesIcon,
  ContactsRounded as ClinicDetailsIcon,
  DoneAllRounded as DoneIcon,
  ExpandLessRounded as ExpandLessIcon,
  ExpandMoreRounded as ExpandMoreIcon,
  GroupRounded as PeopleIcon,
  HomeRounded as HomeIcon,
  HourglassBottomRounded as WaitingIcon,
  Inventory2Rounded as ItemsIcon,
  LibraryBooksRounded as ReportsIcon,
  ManageAccountsRounded as EmployeeManagementIcon,
  MessageRounded as MessageIcon,
  MoneyRounded as PaymentModesIcon,
  PaymentRounded as PaymentChannelsIcon,
  PestControlRounded as DiseasesIcon,
  ScheduleRounded as PatientsToReturnIcon,
  SettingsRounded as SettingsIcon,
  TrendingDownRounded as ExpensesIcon,
  WindowRounded as DepartmentsIcon
} from "@mui/icons-material";

const SideMenu = ({ drawerOpen, setDrawerOpen, user }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [open, setOpen] = useState();

  useEffect(() => {
    if (user) {
      setItems([
        {
          id: "1",
          title: "Dashboard",
          icon: <HomeIcon />,
          to: "/dashboard",
        },
        {
          id: "2",
          title: "Patient Records",
          icon: <ReportsIcon />,
          to: "/patient-records/patients",
        },
        {
          id: "3",
          title: "RECEPTION",
          show: !!drawerOpen && user.privileges.reception,
        },
        {
          id: "4",
          title: "Patients/Customers",
          icon: <PeopleIcon />,
          to: "/reception/patients",
          show: user.privileges.reception,
        },
        {
          id: "5",
          title: "Patients to Return",
          icon: <PatientsToReturnIcon />,
          to: "/reception/to-return/patients",
          show: user.privileges.reception,
        },
        {
          id: "6",
          title: "Sent Messages",
          icon: <MessageIcon />,
          to: "/reception/sent-messages",
          show: user.privileges.reception,
        },
        {
          id: "7",
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/reception/reports",
          show: user.privileges.reception,
          items: [
            {
              id: "7.1",
              title: "Patient Registration Report",
              icon: <ReportsIcon />,
              to: "/patient-registration",
            },
          ]
        },
        {
          id: "8",
          title: "PAYMENT CENTER",
          show: !!drawerOpen && user.privileges.payment_center,
        },
        {
          id: "9",
          title: "Patients Sent to Cashier",
          icon: <WaitingIcon />,
          to: "/payment-center/pending-cash-patients",
          show: user.privileges.payment_center,
        },
        {
          id: "10",
          title: "Credit Patients Approval",
          icon: <WaitingIcon />,
          to: "/payment-center/pending-credit-patients",
          show: user.privileges.payment_center,
        },
        {
          id: "11",
          title: "Pending Patient Bills",
          icon: <WaitingIcon />,
          to: "/payment-center/patient-bills/pending",
          show: user.privileges.payment_center,
        },
        {
          id: "12",
          title: "Cleared Patient Bills",
          icon: <DoneIcon />,
          to: "/payment-center/patient-bills/cleared",
          show: user.privileges.payment_center,
        },
        {
          id: "13",
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/payment-center/reports",
          show: user.privileges.payment_center,
          items: [
            {
              id: "13.1",
              title: "Cash Collection Report",
              icon: <ReportsIcon />,
              to: "/cash-collection",
            },
            {
              id: "13.2",
              title: "Credit Collection Report",
              icon: <ReportsIcon />,
              to: "/credit-collection",
            },
            {
              id: "13.3",
              title: "Pending Patient Bills Report",
              icon: <ReportsIcon />,
              to: "/pending-patient-bills",
            },
            {
              id: "13.4",
              title: "Cleared Patient Bills Report",
              icon: <ReportsIcon />,
              to: "/cleared-patient-bills",
            },
            {
              id: "13.5",
              title: "Bill Collection Report",
              icon: <ReportsIcon />,
              to: "/patient-bill-collection",
            },
          ],
        },
        {
          id: "14",
          title: "CONSULTATION ROOM",
          show: !!drawerOpen && user.privileges.consultation_room,
        },
        {
          id: "15",
          title: "Patients Sent to Doctor",
          icon: <WaitingIcon />,
          to: "/consultation-room/consultation-patients/pending",
          show: user.privileges.consultation_room,
        },
        {
          id: "16",
          title: "Consulted Patients",
          icon: <DoneIcon />,
          to: "/consultation-room/consultation-patients/consulted",
          show: user.privileges.consultation_room,
        },
        {
          id: "17",
          title: "OPTICIAN CENTER",
          show: !!drawerOpen && user.privileges.optician_center,
        },
        {
          id: "18",
          title: "Patients Sent to Optician",
          icon: <WaitingIcon />,
          to: "/optician-center/consultation-patients/pending",
          show: user.privileges.optician_center,
        },
        {
          id: "19",
          title: "Consulted Patients",
          icon: <DoneIcon />,
          to: "/optician-center/consultation-patients/consulted",
          show: user.privileges.optician_center,
        },
        {
          id: "20",
          title: "Dispensing Requests",
          icon: <WaitingIcon />,
          to: "/optician-center/dispensing-requests",
          show: user.privileges.optician_center,
        },
        {
          id: "21",
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/optician-center/reports",
          show: user.privileges.optician_center,
          items: [
            {
              id: "21.1",
              title: "Items Dispensed Report",
              icon: <ReportsIcon />,
              to: "/items-dispensed",
            },
            {
              id: "21.2",
              title: "Items Not Dispensed Report",
              icon: <ReportsIcon />,
              to: "/items-not-dispensed",
            },
            {
              id: "21.3",
              title: "Item Balance Report",
              icon: <ReportsIcon />,
              to: "/item-balance",
            },
          ],
        },
        {
          id: "22",
          title: "MEDICINE CENTER",
          show: !!drawerOpen && user.privileges.medicine_center,
        },
        {
          id: "23",
          title: "Dispensing Requests",
          icon: <WaitingIcon />,
          to: "/medicine-center/dispensing-requests",
          show: user.privileges.medicine_center,
        },
        {
          id: "24",
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/medicine-center/reports",
          show: user.privileges.medicine_center,
          items: [
            {
              id: "24.1",
              title: "Medicines Dispensed Report",
              icon: <ReportsIcon />,
              to: "/medicines-dispensed",
            },
            {
              id: "24.2",
              title: "Medicines Not Dispensed Report",
              icon: <ReportsIcon />,
              to: "/medicines-not-dispensed",
            },
            {
              id: "24.3",
              title: "Item Balance Report",
              icon: <ReportsIcon />,
              to: "/item-balance",
            },
          ],
        },
        {
          id: "25",
          title: "PROCEDURE ROOM",
          show: !!drawerOpen && user.privileges.procedure_room,
        },
        {
          id: "26",
          title: "Procedure Requests",
          icon: <WaitingIcon />,
          to: "/procedure-room/procedure-requests",
          show: user.privileges.procedure_room,
        },
        {
          id: "27",
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/procedure-room/reports",
          show: user.privileges.procedure_room,
          items: [
            {
              id: "27.1",
              title: "Served Procedures Report",
              icon: <ReportsIcon />,
              to: "/served-procedures",
            },
            {
              id: "27.2",
              title: "Pending Procedures Report",
              icon: <ReportsIcon />,
              to: "/pending-procedures",
            },
          ],
        },
        {
          id: "28",
          title: "INVENTORY MANAGEMENT",
          show: !!drawerOpen && user.privileges.inventory_management,
        },
        {
          id: "29",
          title: "Stocktaking",
          icon: <ItemsIcon />,
          to: "/inventory-management/stocktaking",
          show: user.privileges.inventory_management,
        },
        {
          id: "30",
          title: "Previous Stocktakes",
          icon: <ItemsIcon />,
          to: "/inventory-management/stocktakes",
          show: false,
        },
        {
          id: "31",
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/inventory-management/reports",
          show: user.privileges.inventory_management,
          items: [
            {
              id: "31.1",
              title: "Item Balance Report",
              icon: <ReportsIcon />,
              to: "/item-balance",
            },
            {
              id: "31.2",
              title: "Quantity Dispensed Report",
              icon: <ReportsIcon />,
              to: "/item-quantity-dispensed",
            },
            {
              id: "31.3",
              title: "Stock Ledger",
              icon: <ReportsIcon />,
              to: "/stock-ledger",
            },
          ],
        },
        {
          id: "32",
          title: "FINANCIAL MANAGEMENT",
          show: !!drawerOpen && user.privileges.financial_management,
        },
        {
          id: "33",
          title: "Expenses",
          icon: <ExpensesIcon />,
          to: "/financial-management/expenses",
          show: user.privileges.financial_management,
        },
        {
          id: "34",
          title: "Reports",
          icon: <ReportsIcon />,
          to: "/financial-management/reports",
          show: user.privileges.financial_management,
          items: [
            {
              id: "34.1",
              title: "Expenses Report",
              icon: <ReportsIcon />,
              to: "/expenses",
            },
          ],
        },
        {
          id: "35",
          title: "EMPLOYEE MANAGEMENT",
          show: !!drawerOpen && user.privileges.employee_management,
        },
        {
          id: "36",
          title: "Employees",
          icon: <EmployeeManagementIcon />,
          to: "/employee-management/employees",
          show: user.privileges.employee_management,
        },
        {
          id: "37",
          title: "SETTINGS",
          show: !!drawerOpen && user.privileges.settings,
        },
        {
          id: "38",
          title: "Item Management",
          icon: <ItemsIcon />,
          to: "/settings/item-management",
          show: user.privileges.settings,
          items: [
            {
              id: "38.1",
              title: "Units of Measure",
              icon: <SettingsIcon />,
              to: "/units-of-measure",
            },
            {
              id: "38.2",
              title: "Lens Types",
              icon: <SettingsIcon />,
              to: "/lens-types",
            },
            {
              id: "38.3",
              title: "Items",
              icon: <SettingsIcon />,
              to: "/items",
            },
          ],
        },
        {
          id: "39",
          title: "Payment Modes",
          icon: <PaymentModesIcon />,
          to: "/settings/payment-modes",
          show: user.privileges.settings,
        },
        {
          id: "40",
          title: "Payment Channels",
          icon: <PaymentChannelsIcon />,
          to: "/settings/payment-channels",
          show: user.privileges.settings,
        },
        {
          id: "41",
          title: "Diseases",
          icon: <DiseasesIcon />,
          to: "/settings/diseases",
          show: user.privileges.settings,
        },
        {
          id: "42",
          title: "Expense Categories",
          icon: <ExpensesIcon />,
          to: "/settings/expense-categories",
          show: user.privileges.settings,
        },
        {
          id: "43",
          title: "Departments",
          icon: <DepartmentsIcon />,
          to: "/settings/departments",
          show: user.privileges.settings,
        },
        {
          id: "44",
          title: "Job Titles",
          icon: <JobTitlesIcon />,
          to: "/settings/job-titles",
          show: user.privileges.settings,
        },
        {
          id: "45",
          title: "Clinic Details",
          icon: <ClinicDetailsIcon />,
          to: "/settings/clinic-details",
          show: user.privileges.settings,
        },
        {
          id: "46",
          title: "System Preferences",
          icon: <SettingsIcon />,
          to: "/settings/preferences",
          show: user.privileges.settings,
        },
      ]);
    } else {
      setItems([]);
    }
  }, [drawerOpen, user]);

  return (
    <List
      component="nav"
      subheader={drawerOpen ?
        <ListSubheader sx={{ px: 3 }}>MENU</ListSubheader>
        : null
      }
      dense
    >
      {items.filter((e) => (typeof e.show === "undefined") || e.show).map((e) => (
        !e.to ?
          <ListSubheader
            key={e.id}
            sx={{ px: 3 }}
          >
            {e.title}
          </ListSubheader>
          :
          <React.Fragment key={e.id}>
            <ListItemButton
              selected={location.pathname.indexOf(e.to) !== -1}
              onClick={() => {
                if (e.items && e.items.length) {
                  setOpen(!open ? e.to : null);
                } else {
                  if (typeof setDrawerOpen === "function") {
                    setDrawerOpen(false);
                  }

                  navigate(e.to);
                }
              }}
              sx={{
                "&.Mui-selected": {
                  color: (theme) => theme.palette.primary.main,
                  borderRight: (theme) => `3px solid ${theme.palette.primary.main}`,
                  backgroundColor: (theme) => theme.palette.mode === "light" ? alpha(theme.palette.primary.main, 0.08) : "transparent",

                  "& .MuiListItemIcon-root": {
                    color: "inherit"
                  }
                },
                px: 3,
              }}
            >
              {e.icon ?
                <ListItemIcon sx={{ minWidth: drawerOpen ? 32 : 56 }}>{e.icon}</ListItemIcon>
                : null
              }
              <ListItemText primary={e.title}/>
              {e.items && e.items.length ?
                <React.Fragment>{open === e.to ? <ExpandLessIcon /> : <ExpandMoreIcon />}</React.Fragment>
                : null
              }
            </ListItemButton>

            {e.items && e.items.length ?
              <Collapse
                in={open === e.to}
                unmountOnExit
              >
                <List
                  component="div"
                  dense
                >
                  {e.items.filter((f) => (typeof f.show === "undefined") || f.show).map(f => (
                    <ListItemButton
                      key={f.id}
                      selected={location.pathname.indexOf(e.to + f.to) !== -1}
                      onClick={() => navigate(e.to + f.to)}
                      sx={{
                        "&.Mui-selected": {
                          color: (theme) => theme.palette.primary.main,
                          borderRight: (theme) => `3px solid ${theme.palette.primary.main}`,
                          backgroundColor: (theme) => theme.palette.mode === "light" ? alpha(theme.palette.primary.main, 0.08) : "transparent",

                          "& .MuiListItemIcon-root": {
                            color: "inherit"
                          }
                        },
                        px: 3,
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: drawerOpen ? 32 : 56 }}>{f.icon}</ListItemIcon>
                      <ListItemText primary={f.title}/>
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
              : null
            }
          </React.Fragment>
      ))}
    </List>
  );
};

export default SideMenu;
