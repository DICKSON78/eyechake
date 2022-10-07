import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Collapse, List, ListItemButton, ListItemIcon, ListItemText, ListSubheader } from "@mui/material";

import {
  ExpandLessRounded as ExpandLessIcon,
  ExpandMoreRounded as ExpandMoreIcon,
  Groups2 as UsersIcon,
  HomeRounded as HomeIcon,
  Inventory2Rounded as ItemsIcon,
  LinkRounded as LinkIcon,
  List as ListIcon,
  MoneyRounded as PaymentModesIcon,
  PersonAddRounded as PatientRegistrationIcon
} from "@mui/icons-material";

const SideMenu = ({ drawerOpen, setDrawerOpen, user }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    setItems([
      {
        id: "1",
        title: "Dashboard",
        icon: <HomeIcon />,
        to: "/dashboard",
      },
      {
        id: "2",
        title: "Reception",
        show: !!drawerOpen,
      },
      {
        id: "3",
        title: "Patients/Customers",
        icon: <PatientRegistrationIcon />,
        to: "/reception/patients",
      },
      {
        id: "9",
        title: "Settings",
        show: !!drawerOpen,
      },
      {
        id: "10",
        title: "Payment Modes",
        icon: <PaymentModesIcon />,
        to: "/settings/payment-modes",
      },
      {
        id: "11",
        title: "Item Management",
        icon: <ItemsIcon />,
        to: "/settings/item-management",
        items: [
          {
            id: "7.1",
            title: "Units of Measure",
            icon: <LinkIcon />,
            to: "/units-of-measure",
          },
          {
            id: "7.2",
            title: "Lens Types",
            icon: <LinkIcon />,
            to: "/lens-types",
          },
          {
            id: "7.3",
            title: "Items",
            icon: <LinkIcon />,
            to: "/items",
          },
        ],
      },
    ]);
  }, [drawerOpen]);

  return (
    <List
      component="nav"
      subheader={drawerOpen ?
        <ListSubheader sx={{ px: 3 }}>MENU</ListSubheader>
        : null
      }
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
              selected={location.pathname === e.to}
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
                  backgroundColor: "transparent",
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
                <List component="div">
                  {e.items.filter((f) => (typeof f.show === "undefined") || f.show).map(f => (
                    <ListItemButton
                      key={f.id}
                      selected={location.pathname.indexOf(e.to + f.to) !== -1}
                      onClick={() => navigate(e.to + f.to)}
                      sx={{
                        "&.Mui-selected": {
                          backgroundColor: "transparent",
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
