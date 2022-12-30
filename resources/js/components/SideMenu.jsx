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
          title: "Dashboard",
          icon: <HomeIcon />,
          to: "/dashboard",
        },
        {
          title: "Patient Records",
          icon: <ReportsIcon />,
          to: "/patient-records/patients",
        },
        {
          title: "RECEPTION",
          show: !!drawerOpen && user.privileges.reception,
        },
        {
          title: "Patients/Customers",
          icon: <PeopleIcon />,
          to: "/reception/patients",
          show: user.privileges.reception,
        },
        {
          title: "Patients to Return",
          icon: <PatientsToReturnIcon />,
          to: "/reception/to-return/patients",
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
              to: "/patient-registration",
            },
          ]
        },
        {
          title: "PAYMENT CENTER",
          show: !!drawerOpen && user.privileges.payment_center,
        },
        {
          title: "Patients Sent to Cashier",
          icon: <WaitingIcon />,
          to: "/payment-center/pending-cash-patients",
          show: user.privileges.payment_center,
        },
        {
          title: "Credit Patients Approval",
          icon: <WaitingIcon />,
          to: "/payment-center/pending-credit-patients",
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
              to: "/daily-cash-collection",
            },
            {
              title: "Expenses Report",
              icon: <ReportsIcon />,
              to: "/expenses",
            },
          ],
        },
        {
          title: "CONSULTATION ROOM",
          show: !!drawerOpen && user.privileges.consultation_room,
        },
        {
          title: "Patients Sent to Doctor",
          icon: <WaitingIcon />,
          to: "/consultation-room/consultation-patients/pending",
          show: user.privileges.consultation_room,
        },
        {
          title: "Consulted Patients",
          icon: <DoneIcon />,
          to: "/consultation-room/consultation-patients/consulted",
          show: user.privileges.consultation_room,
        },
        {
          title: "OPTICIAN CENTER",
          show: !!drawerOpen && user.privileges.optician_center,
        },
        {
          title: "Patients Sent to Optician",
          icon: <WaitingIcon />,
          to: "/optician-center/consultation-patients/pending",
          show: user.privileges.optician_center,
        },
        {
          title: "Consulted Patients",
          icon: <DoneIcon />,
          to: "/optician-center/consultation-patients/consulted",
          show: user.privileges.optician_center,
        },
        {
          title: "Dispensing Requests",
          icon: <WaitingIcon />,
          to: "/optician-center/dispensing-requests",
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
              to: "/items-dispensed",
            },
            {
              title: "Items Not Dispensed Report",
              icon: <ReportsIcon />,
              to: "/items-not-dispensed",
            },
            {
              title: "Item Balance Report",
              icon: <ReportsIcon />,
              to: "/item-balance",
            },
          ],
        },
        {
          title: "MEDICINE CENTER",
          show: !!drawerOpen && user.privileges.medicine_center,
        },
        {
          title: "Dispensing Requests",
          icon: <WaitingIcon />,
          to: "/medicine-center/dispensing-requests",
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
              to: "/medicines-dispensed",
            },
            {
              title: "Medicines Not Dispensed Report",
              icon: <ReportsIcon />,
              to: "/medicines-not-dispensed",
            },
            {
              title: "Item Balance Report",
              icon: <ReportsIcon />,
              to: "/item-balance",
            },
          ],
        },
        {
          title: "PROCEDURE ROOM",
          show: !!drawerOpen && user.privileges.procedure_room,
        },
        {
          title: "Procedure Requests",
          icon: <WaitingIcon />,
          to: "/procedure-room/procedure-requests",
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
              to: "/served-procedures",
            },
            {
              title: "Pending Procedures Report",
              icon: <ReportsIcon />,
              to: "/pending-procedures",
            },
          ],
        },
        {
          title: "INVENTORY MANAGEMENT",
          show: !!drawerOpen && user.privileges.inventory_management,
        },
        {
          title: "Stocktaking",
          icon: <ItemsIcon />,
          to: "/inventory-management/stocktaking",
          show: user.privileges.inventory_management,
        },
        {
          title: "Previous Stocktakes",
          icon: <ItemsIcon />,
          to: "/inventory-management/stocktakes",
          show: false,
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
              to: "/item-balance",
            },
            {
              title: "Quantity Dispensed Report",
              icon: <ReportsIcon />,
              to: "/item-quantity-dispensed",
            },
          ],
        },
        {
          title: "FINANCIAL MANAGEMENT",
          show: !!drawerOpen && user.privileges.financial_management,
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
              to: "/cash-collection",
            },
            // {
            //   title: "Credit Collection Report",
            //   icon: <ReportsIcon />,
            //   to: "/credit-collection",
            // },
            {
              title: "Pending Patient Bills Report",
              icon: <ReportsIcon />,
              to: "/pending-patient-bills",
            },
            {
              title: "Cleared Patient Bills Report",
              icon: <ReportsIcon />,
              to: "/cleared-patient-bills",
            },
            {
              title: "Bill Payment Report",
              icon: <ReportsIcon />,
              to: "/patient-bill-payments",
            },
            {
              title: "Expenses Report",
              icon: <ReportsIcon />,
              to: "/expenses",
            },
            // {
            //   title: "Profit & Loss Report",
            //   icon: <ReportsIcon />,
            //   to: "/profit-and-loss",
            // },
          ],
        },
        {
          title: "EMPLOYEE MANAGEMENT",
          show: !!drawerOpen && user.privileges.employee_management,
        },
        {
          title: "Employees",
          icon: <EmployeeManagementIcon />,
          to: "/employee-management/employees",
          show: user.privileges.employee_management,
        },
        {
          title: "SETTINGS",
          show: !!drawerOpen && user.privileges.settings,
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
              to: "/units-of-measure",
            },
            {
              title: "Lens Types",
              icon: <SettingsIcon />,
              to: "/lens-types",
            },
            {
              title: "Items",
              icon: <SettingsIcon />,
              to: "/items",
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
      ]);
    } else {
      setItems([]);
    }
  }, [drawerOpen, user]);

  return (
    <List
      component="nav"
      subheader={drawerOpen ?
        <ListSubheader sx={{ px: { xs: 2, sm: 2, md: 3 } }}>MENU</ListSubheader>
        : null
      }
      dense
    >
      {items.filter((e) => (typeof e.show === "undefined") || e.show).map((e) => (
        !e.to ?
          <ListSubheader
            key={e.title}
            sx={{ px: { xs: 2, sm: 2, md: 3 } }}
          >
            {e.title}
          </ListSubheader>
          :
          <React.Fragment key={e.to}>
            <ListItemButton
              selected={location.pathname.indexOf(e.to) !== -1}
              onClick={() => {
                if (e.items && e.items.length) {
                  setOpen(open === e.to ? null : e.to);
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
                px: { xs: 2, sm: 2, md: 3 },
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
                      key={f.to}
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
                        px: { xs: 2, sm: 2, md: 3 },
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
