import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Collapse, List, ListItemButton, ListItemIcon, ListItemText, ListSubheader } from "@mui/material";

import {
  DoneAllOutlined as DoneIcon,
  ExpandLessRounded as ExpandLessIcon,
  ExpandMoreRounded as ExpandMoreIcon,
  HomeRounded as HomeIcon,
  HourglassBottomRounded as WaitingIcon,
  Inventory2Rounded as ItemsIcon,
  LinkRounded as LinkIcon,
  MoneyRounded as PaymentModesIcon,
  PaymentRounded as PaymentChannelsIcon,
  PersonRounded as PatientsIcon,
  PestControlRounded as DiseasesIcon
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
          icon: <HomeIcon />,
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
          icon: <PatientsIcon />,
          to: "/reception/patients",
          show: user.privileges.reception,
        },
        {
          id: "5",
          title: "Reports",
          icon: <ItemsIcon />,
          to: "/reception/reports",
          show: user.privileges.reception,
          items: [
            {
              id: "5.1",
              title: "Patient Registration Report",
              icon: <LinkIcon />,
              to: "/patient-registration",
            },
          ]
        },
        {
          id: "6",
          title: "PAYMENT CENTER",
          show: !!drawerOpen && user.privileges.payment_center,
        },
        {
          id: "7",
          title: "Patients Sent to Cashier",
          icon: <WaitingIcon />,
          to: "/payment-center/pending-cash-patients",
          show: user.privileges.payment_center,
        },
        {
          id: "8",
          title: "Credit Patients Approval",
          icon: <WaitingIcon />,
          to: "/payment-center/pending-credit-patients",
          show: user.privileges.payment_center,
        },
        {
          id: "9",
          title: "Pending Patient Bills",
          icon: <WaitingIcon />,
          to: "/payment-center/patient-bills/pending",
          show: user.privileges.payment_center,
        },
        {
          id: "10",
          title: "Cleared Patient Bills",
          icon: <WaitingIcon />,
          to: "/payment-center/patient-bills/cleared",
          show: user.privileges.payment_center,
        },
        {
          id: "11",
          title: "Reports",
          icon: <ItemsIcon />,
          to: "/payment-center/reports",
          show: user.privileges.payment_center,
          items: [
            {
              id: "11.1",
              title: "Cash Collection Report",
              icon: <LinkIcon />,
              to: "/cash-collection",
            },
            {
              id: "11.2",
              title: "Credit Collection Report",
              icon: <LinkIcon />,
              to: "/credit-collection",
            },
            {
              id: "11.3",
              title: "Pending Patient Bills Report",
              icon: <LinkIcon />,
              to: "/pending-patient-bills",
            },
            {
              id: "11.4",
              title: "Cleared Patient Bills Report",
              icon: <LinkIcon />,
              to: "/cleared-patient-bills",
            },
            {
              id: "11.5",
              title: "Bill Collection Report",
              icon: <LinkIcon />,
              to: "/patient-bill-collection",
            },
          ],
        },
        {
          id: "12",
          title: "CONSULTATION ROOM",
          show: !!drawerOpen && user.privileges.consultation_room,
        },
        {
          id: "13",
          title: "Patients Sent to Doctor",
          icon: <WaitingIcon />,
          to: "/consultation-room/consultation-patients/pending",
          show: user.privileges.consultation_room,
        },
        {
          id: "14",
          title: "Consulted Patients",
          icon: <DoneIcon />,
          to: "/consultation-room/consultation-patients/consulted",
          show: user.privileges.consultation_room,
        },
        {
          id: "15",
          title: "OPTICIAN CENTER",
          show: !!drawerOpen && user.privileges.optician_center,
        },
        {
          id: "16",
          title: "Patients Sent to Optician",
          icon: <WaitingIcon />,
          to: "/optician-center/consultation-patients/pending",
          show: user.privileges.optician_center,
        },
        {
          id: "17",
          title: "Consulted Patients",
          icon: <DoneIcon />,
          to: "/optician-center/consultation-patients/consulted",
          show: user.privileges.optician_center,
        },
        {
          id: "18",
          title: "Dispensing Requests",
          icon: <WaitingIcon />,
          to: "/optician-center/dispensing-requests",
          show: user.privileges.optician_center,
        },
        {
          id: "19",
          title: "Reports",
          icon: <ItemsIcon />,
          to: "/optician-center/reports",
          show: user.privileges.optician_center,
          items: [
            {
              id: "19.1",
              title: "Items Dispensed Report",
              icon: <LinkIcon />,
              to: "/items-dispensed",
            },
            {
              id: "19.2",
              title: "Items Not Dispensed Report",
              icon: <LinkIcon />,
              to: "/items-not-dispensed",
            },
            {
              id: "19.3",
              title: "Item Balance Report",
              icon: <LinkIcon />,
              to: "/item-balance",
            },
          ],
        },
        {
          id: "20",
          title: "MEDICINE CENTER",
          show: !!drawerOpen && user.privileges.medicine_center,
        },
        {
          id: "21",
          title: "Dispensing Requests",
          icon: <WaitingIcon />,
          to: "/medicine-center/reports-requests",
          show: user.privileges.medicine_center,
        },
        {
          id: "22",
          title: "Reports",
          icon: <ItemsIcon />,
          to: "/medicine-center/reports",
          show: user.privileges.medicine_center,
          items: [
            {
              id: "22.1",
              title: "Medicines Dispensed Report",
              icon: <LinkIcon />,
              to: "/medicines-dispensed",
            },
            {
              id: "22.2",
              title: "Medicines Not Dispensed Report",
              icon: <LinkIcon />,
              to: "/medicines-not-dispensed",
            },
            {
              id: "22.3",
              title: "Item Balance Report",
              icon: <LinkIcon />,
              to: "/item-balance",
            },
          ],
        },
        {
          id: "23",
          title: "PROCEDURE ROOM",
          show: !!drawerOpen && user.privileges.procedure_room,
        },
        {
          id: "24",
          title: "Procedure Requests",
          icon: <WaitingIcon />,
          to: "/procedure-room/procedure-requests",
          show: user.privileges.procedure_room,
        },
        {
          id: "25",
          title: "Reports",
          icon: <ItemsIcon />,
          to: "/procedure-room/reports",
          show: user.privileges.procedure_room,
          items: [
            {
              id: "25.1",
              title: "Served Procedures Report",
              icon: <LinkIcon />,
              to: "/served-procedures",
            },
            {
              id: "25.2",
              title: "Pending Procedures Report",
              icon: <LinkIcon />,
              to: "/pending-procedures",
            },
          ],
        },
        {
          id: "26",
          title: "INVENTORY MANAGEMENT",
          show: !!drawerOpen && user.privileges.inventory_management,
        },
        {
          id: "27",
          title: "Stocktaking",
          icon: <ItemsIcon />,
          to: "/inventory-management/stocktaking",
          show: user.privileges.inventory_management,
        },
        {
          id: "28",
          title: "Previous Stocktakes",
          icon: <ItemsIcon />,
          to: "/inventory-management/stocktakes",
          show: false,
        },
        {
          id: "29",
          title: "Reports",
          icon: <ItemsIcon />,
          to: "/inventory-management/reports",
          show: user.privileges.inventory_management,
          items: [
            {
              id: "29.1",
              title: "Item Balance Report",
              icon: <LinkIcon />,
              to: "/item-balance",
            },
            {
              id: "29.2",
              title: "Quantity Dispensed Report",
              icon: <LinkIcon />,
              to: "/item-quantity-dispensed",
            },
            {
              id: "29.3",
              title: "Stock Ledger",
              icon: <LinkIcon />,
              to: "/stock-ledger",
            },
          ],
        },
        {
          id: "30",
          title: "FINANCIAL MANAGEMENT",
          show: !!drawerOpen && user.privileges.financial_management,
        },
        {
          id: "31",
          title: "Expenses",
          icon: <ItemsIcon />,
          to: "/financial-management/expenses",
          show: user.privileges.financial_management,
        },
        {
          id: "32",
          title: "Reports",
          icon: <ItemsIcon />,
          to: "/financial-management/reports",
          show: user.privileges.financial_management,
          items: [
            {
              id: "32.1",
              title: "Expenses Report",
              icon: <LinkIcon />,
              to: "/expenses",
            },
          ],
        },
        {
          id: "33",
          title: "EMPLOYEE MANAGEMENT",
          show: !!drawerOpen && user.privileges.employee_management,
        },
        {
          id: "34",
          title: "Employees",
          icon: <WaitingIcon />,
          to: "/employee-management/employees",
          show: user.privileges.employee_management,
        },
        {
          id: "35",
          title: "SETTINGS",
          show: !!drawerOpen && user.privileges.settings,
        },
        {
          id: "36",
          title: "Item Management",
          icon: <ItemsIcon />,
          to: "/settings/item-management",
          show: user.privileges.settings,
          items: [
            {
              id: "36.1",
              title: "Units of Measure",
              icon: <LinkIcon />,
              to: "/units-of-measure",
            },
            {
              id: "36.2",
              title: "Lens Types",
              icon: <LinkIcon />,
              to: "/lens-types",
            },
            {
              id: "36.3",
              title: "Items",
              icon: <LinkIcon />,
              to: "/items",
            },
          ],
        },
        {
          id: "37",
          title: "Payment Modes",
          icon: <PaymentModesIcon />,
          to: "/settings/payment-modes",
          show: user.privileges.settings,
        },
        {
          id: "38",
          title: "Payment Channels",
          icon: <PaymentChannelsIcon />,
          to: "/settings/payment-channels",
          show: user.privileges.settings,
        },
        {
          id: "39",
          title: "Diseases",
          icon: <DiseasesIcon />,
          to: "/settings/diseases",
          show: user.privileges.settings,
        },
        {
          id: "40",
          title: "Expense Categories",
          icon: <DiseasesIcon />,
          to: "/settings/expense-categories",
          show: user.privileges.settings,
        },
        {
          id: "41",
          title: "Departments",
          icon: <DiseasesIcon />,
          to: "/settings/departments",
          show: user.privileges.settings,
        },
        {
          id: "42",
          title: "Job Titles",
          icon: <DiseasesIcon />,
          to: "/settings/job-titles",
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
