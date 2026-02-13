import React, { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { useTheme } from "@mui/material/styles";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  CardHeader,
  Chip,
  Divider,
  Drawer,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu as MuiMenu,
  MenuItem,
  MenuList,
  Modal as MuiModal,
  Popover,
  Stack,
  ThemeProvider,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import {
  AccountBalanceRounded as PaymentIcon,
  AssessmentRounded as ReportsIcon,
  BusinessRounded as MedicineIcon,
  DashboardRounded as DashboardIcon,
  DarkModeRounded as DarkModeIcon,
  EventNoteRounded as AppointmentIcon,
  ExpandMoreRounded as ChevronDownIcon,
  HomeRounded as HomeIcon,
  LightModeOutlined as LightModeIcon,
  LocalHospitalRounded as ConsultationIcon,
  LockRounded as LockIcon,
  LogoutRounded as LogoutIcon,
  MedicationRounded as PharmacyIcon,
  MoreVert as MoreIcon,
  Person2Rounded as UserIcon,
  RemoveRedEyeRounded as OpticianIcon,
  ScienceRounded as ProcedureIcon,
  SettingsRounded as SettingsIcon,
  ShoppingCartRounded as InventoryIcon,
  VisibilityRounded as EyeIcon,
} from "@mui/icons-material";
import MenuIcon from "../components/icons/Menu";

import darkTheme from "../themes/dark";
import Menu from "../components/Menu";
import Modal from "../components/Modal";
import ChangePassword from "../pages/auth/ChangePassword";
import loader from "../../images/loader.svg";

import useFetch from "../hooks/useFetch";
import { useFilterContext } from "../contexts/FilterContext";

import { numberFormat } from "../helpers";

const drawerWidth = 272;

const drawerOpenedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const drawerClosedMixin = (theme) => ({
  width: 0,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  whiteSpace: "nowrap",
});

const Default = ({ setThemeMode, setUser, smsBalance }) => {
  const notificationsTimer = useRef();
  const modalRef = useRef();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const breakpointDownMedium = useMediaQuery(theme.breakpoints.down("md"));
  const { currentFilter } = useFilterContext();
  const breakpointUpMedium = useMediaQuery(theme.breakpoints.up("md"));

  const { data: user, loading, error } = useFetch(
    "/api/auth/user",
    null,
    true,
    null,
    (response) => response.data.data
  );

  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [navMenuAnchor, setNavMenuAnchor] = useState({});

  useEffect(() => {
    return () => {
      if (notificationsTimer.current) {
        window.clearInterval(notificationsTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (user) {
      console.log('[Default Layout] User loaded from API:', {
        id: user.id,
        username: user.username,
        role: user.role,
        privileges: user.privileges,
        privilegesType: typeof user.privileges,
        privilegesKeys: user.privileges ? Object.keys(user.privileges) : [],
        isAdmin: user.role === 'Admin' || user.is_admin
      });
      window.user = user;
      setUser(user);
      // Trigger a notification refresh once user is present to ensure authenticated fetch
      try {
        if (window.notificationEvents && typeof window.notificationEvents.refresh === 'function') {
          window.notificationEvents.refresh();
        }
      } catch (e) {}
    }
  }, [user, setUser]);

  useEffect(() => {
    if (error && !loading) {
      // Define public routes that don't require authentication
      const publicRoutes = ["/", "/about", "/features", "/appointment", "/contact", "/login"];
      const currentPath = location.pathname;
      const isPublicRoute = publicRoutes.some(route => currentPath === route);
      
      // Only redirect to login if we're not on a public route
      if (!isPublicRoute) {
        navigate("/login");
      }
    }
  }, [error, loading, navigate, location.pathname]);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const toggleTheme = () => {
    const themeMode = theme.palette.mode === "light" ? "dark" : "light";
    window.localStorage.removeItem("theme_mode");
    window.localStorage.setItem("theme_mode", themeMode);
    setThemeMode(themeMode);
  };

  const handleAccountMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setIsAccountMenuOpen(true);
  };

  const handleAccountMenuClose = () => {
    setIsAccountMenuOpen(false);
    setAnchorEl(null);
  };

  const openChangePasswordModal = () => {
    let component = <ChangePassword modal={modalRef.current} />;

    modalRef.current.open("Change Password", component);
  };

  const handleLogout = () => {
    window.localStorage.clear();
    navigate("/login");
  };

  const handleNavMenuOpen = (event, menuKey) => {
    setNavMenuAnchor({ ...navMenuAnchor, [menuKey]: event.currentTarget });
  };

  const handleNavMenuClose = (menuKey) => {
    setNavMenuAnchor({ ...navMenuAnchor, [menuKey]: null });
  };

  // Navigation menu structure
  const navigationItems = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: <DashboardIcon />,
      to: '/dashboard',
      show: user?.privileges?.dashboard,
    },
    {
      key: 'reception',
      label: 'Reception',
      icon: <HomeIcon />,
      show: user?.privileges?.reception,
      items: [
        { label: 'Reception Dashboard', to: '/reception/dashboard' },
        { label: 'Patients/Customers', to: '/reception/patients' },
        { label: 'Prestige Clients', to: '/marketing/prestige-clients' },
        { label: 'Spectacle Patients', to: '/sales-management/glass-patients' },
        { label: 'Patients to Return', to: '/reception/to-return/patients' },
        { label: 'Sent Messages', to: '/reception/sent-messages' },
        { label: 'Reports', to: '/reception/reports' },
      ],
    },
    {
      key: 'payment',
      label: 'Payment Center',
      icon: <PaymentIcon />,
      show: user?.privileges?.payment_center,
      items: [
        { label: 'Payment Dashboard', to: '/payment-center/dashboard' },
        { label: 'Patients Sent to Cashier', to: '/payment-center/pending-cash-patients' },
        { label: 'Credit Patients Approval', to: '/payment-center/pending-credit-patients' },
        { label: 'Pending Patient Bills', to: '/payment-center/patient-bills/pending' },
        { label: 'Cleared Patient Bills', to: '/payment-center/patient-bills/cleared' },
        { label: 'Expenses', to: '/payment-center/expenses' },
        { label: 'Reports', to: '/payment-center/reports' },
      ],
    },
    {
      key: 'consultation',
      label: 'Consultation',
      icon: <ConsultationIcon />,
      show: user?.privileges?.consultation_room,
      items: [
        { label: 'Consultation Dashboard', to: '/consultation-room/dashboard' },
        { label: 'Patients Sent to Doctor', to: '/consultation-room/consultation-patients/pending' },
        { label: 'Consulted Patients', to: '/consultation-room/consultation-patients/consulted' },
        { label: 'Clinical Notes', to: '/consultation-room/clinical-notes' },
        { label: 'Prescriptions', to: '/consultation-room/prescriptions' },
        { label: 'Eye Examinations', to: '/consultation-room/eye-examinations' },
        { label: 'Reports', to: '/consultation-room/reports' },
      ],
    },
    {
      key: 'optician',
      label: 'Optician Center',
      icon: <OpticianIcon />,
      show: user?.privileges?.optician_center,
      items: [
        { label: 'Optician Dashboard', to: '/optician-center/dashboard' },
        { label: 'Glass Patients', to: '/optician-center/glass-patients' },
        { label: 'Dispensing Requests', to: '/optician-center/dispensing-requests' },
        { label: 'Lens Stock', to: '/optician-center/lens-stock' },
        { label: 'Patients Sent', to: '/optician-center/patients-sent' },
        { label: 'Clinical Notes', to: '/optician-center/clinical-notes' },
        { label: 'Reports', to: '/optician-center/reports' },
      ],
    },
    {
      key: 'medicine',
      label: 'Medicine Center',
      icon: <MedicineIcon />,
      show: user?.privileges?.medicine_center,
      items: [
        { label: 'Medicine Dashboard', to: '/medicine-center/dashboard' },
        { label: 'Medicines', to: '/medicine-center/medicines' },
        { label: 'Add Medicine', to: '/medicine-center/add-medicine' },
        { label: 'Medicine Alerts', to: '/medicine-center/medicine-alerts' },
        { label: 'Medicine Taking', to: '/medicine-center/medicine-taking' },
        { label: 'Dispensing Requests', to: '/medicine-center/dispensing-requests' },
        { label: 'Reports', to: '/medicine-center/reports' },
      ],
    },
    {
      key: 'procedure',
      label: 'Procedure Room',
      icon: <ProcedureIcon />,
      show: user?.privileges?.procedure_room,
      items: [
        { label: 'Procedure Dashboard', to: '/procedure-room/dashboard' },
        { label: 'Procedure Requests', to: '/procedure-room/procedure-requests' },
        { label: 'Reports', to: '/procedure-room/reports' },
      ],
    },
    {
      key: 'inventory',
      label: 'Stock',
      icon: <InventoryIcon />,
      show: user?.privileges?.inventory_management,
      items: [
        { label: 'Stock Dashboard', to: '/inventory-management/dashboard' },
        { label: 'Stock Alerts', to: '/inventory-management/stock-alerts' },
        { label: 'Stocktaking', to: '/inventory-management/stocktaking' },
        { label: 'Reports', to: '/inventory-management/reports' },
      ],
    },
    {
      key: 'financial',
      label: 'Financial',
      icon: <PaymentIcon />,
      show: user?.privileges?.financial_management,
      items: [
        { label: 'Financial Dashboard', to: '/financial-management/dashboard' },
        { label: 'Expenses', to: '/financial-management/expenses' },
        { label: 'Reports', to: '/financial-management/reports' },
      ],
    },
    {
      key: 'patient-records',
      label: 'Patient Records',
      icon: <UserIcon />,
      show: true,
      items: [
        { label: 'All Patients', to: '/reception/patients' },
        { label: 'Patient File', to: '/patient-records/patient-file' },
        { label: 'Patient Attachments', to: '/patient-records/patient-attachments' },
        { label: 'Payment History', to: '/patient-records/payment-history' },
      ],
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <SettingsIcon />,
      show: true,
      items: [
        { label: 'User Management', to: '/user-management' },
        { label: 'Appointment Requests', to: '/user-management/appointment-requests' },
        { label: 'Settings', to: '/settings' },
      ],
    },
  ];

  return (
    <React.Fragment>
      {user ? (
        <React.Fragment>
          <ThemeProvider theme={darkTheme}>
            <AppBar
              position="fixed"
              variant="elevation"
              elevation={1}
              sx={{
                zIndex: theme.zIndex.drawer + 1,
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
              }}
            >
              <Toolbar>
                <Tooltip title="Toggle menu">
                  <IconButton
                    edge="start"
                    color="inherit"
                    sx={{ color: "inherit" }}
                    onClick={toggleDrawer}
                  >
                    <MenuIcon />
                  </IconButton>
                </Tooltip>

                {/*<Box*/}
                {/*component="img"*/}
                {/*src={logo}*/}
                {/*alt="Logo"*/}
                {/*width={32}*/}
                {/*height={32}*/}
                {/*ml={2}*/}
                {/*/>*/}

                <Typography
                  variant="h5"
                  fontWeight="bold"
                  ml={1}
                  sx={{ color: "inherit" }}
                >
                  EYE
                  <Typography
                    component="span"
                    sx={{ color: theme.palette.secondary.main }}
                    variant="h5"
                    fontWeight="bold"
                  >
                    CARE
                  </Typography>
                </Typography>

                {/* Navigation Menu Items - Hidden per user request */}
                <Box sx={{ flexGrow: 1 }} />

                <Tooltip
                  title={
                    theme.palette.mode === "light"
                      ? "Enable dark mode"
                      : "Disable dark mode"
                  }
                >
                  <IconButton
                    color="inherit"
                    sx={{ mr: { xs: 2, sm: 2, md: 1 }, color: "inherit" }}
                    onClick={toggleTheme}
                  >
                    {theme.palette.mode === "light" ? (
                      <DarkModeIcon sx={{ color: "inherit" }} />
                    ) : (
                      <LightModeIcon sx={{ color: "inherit" }} />
                    )}
                  </IconButton>
                </Tooltip>

                {user.privileges.dashboard &&
                location.pathname.indexOf("/dashboard") === 0 ? (
                  <Chip
                    variant="outlined"
                    sx={{ mr: { xs: 1, sm: 1, md: 2 } }}
                    color="primary"
                    label={
                      <Typography
                        variant="body2"
                        color="primary.contrastText"
                      >
                        {`SMS Balance: ${numberFormat(smsBalance)}`}
                      </Typography>
                    }
                  />
                ) : null}

                <Chip
                  variant="outlined"
                  sx={{
                    display: { xs: "none", sm: "none", md: "inline-flex" },
                  }}
                  color="primary"
                  avatar={
                    <Avatar>
                      <UserIcon fontSize="small" />
                    </Avatar>
                  }
                  label={
                    <Stack
                      direction="row"
                      alignItems="center"
                    >
                      <Typography
                        variant="body2"
                        color="primary.contrastText"
                      >
                        {user.full_name}
                      </Typography>
                      <ChevronDownIcon sx={{ ml: 0.5 }} />
                    </Stack>
                  }
                  onClick={handleAccountMenuOpen}
                />

                <IconButton
                  color="inherit"
                  sx={{
                    display: {
                      xs: "inline-flex",
                      sm: "inline-flex",
                      md: "none",
                    },
                    color: "inherit",
                  }}
                  onClick={handleAccountMenuOpen}
                >
                  <MoreIcon sx={{ color: "inherit" }} />
                </IconButton>
              </Toolbar>
              <Divider />
            </AppBar>
          </ThemeProvider>

          {/* Drawer for small screens */}
          {breakpointDownMedium ? (
            <Drawer
              container={() => window.document.body}
              variant="temporary"
              open={isDrawerOpen}
              ModalProps={{
                keepMounted: true,
                disableScrollLock: true,
              }}
              sx={{
                "& .MuiDrawer-paper": {
                  boxSizing: "border-box",
                  width: drawerWidth,
                },
              }}
              onClose={toggleDrawer}
            >
              <Toolbar />
              <Menu
                drawerOpen={isDrawerOpen}
                setDrawerOpen={setIsDrawerOpen}
                user={user}
              />
            </Drawer>
          ) : null}
          {/*****/}

          <Box sx={{ display: "flex" }}>
            {/* Drawer for large screens */}
            {breakpointUpMedium ? (
              <Drawer
                variant="permanent"
                ModalProps={{ disableScrollLock: true }}
                sx={{
                  width: drawerWidth,
                  flexShrink: 0,
                  ...(isDrawerOpen && {
                    ...drawerOpenedMixin(theme),
                    "& .MuiDrawer-paper": drawerOpenedMixin(theme),
                  }),
                  ...(!isDrawerOpen && {
                    ...drawerClosedMixin(theme),
                    "& .MuiDrawer-paper": drawerClosedMixin(theme),
                  }),
                }}
              >
                <Toolbar />
                <Menu
                  drawerOpen={isDrawerOpen}
                  user={user}
                />
              </Drawer>
            ) : null}
            {/*****/}

            <Box
              component="main"
              sx={{
                flexGrow: 1,
                minHeight: "100vh",
                overflowX: "auto",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                bgcolor: "background.default",
                '&::-webkit-scrollbar': {
                  width: '8px',
                  height: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'rgba(0,0,0,0.05)',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: 'rgba(0,0,0,0.3)',
                },
              }}
            >
              <Toolbar />
              <Box flexGrow={1}>
                <Outlet />
              </Box>
            </Box>
          </Box>

          <Popover
            anchorEl={anchorEl}
            open={isAccountMenuOpen}
            onClose={handleAccountMenuClose}
          >
            <CardHeader
              title={user.full_name}
              subheader={user.job_title?.name}
              titleTypographyProps={{
                variant: "subtitle1",
                fontWeight: "500",
              }}
              avatar={
                <Avatar>
                  <UserIcon />
                </Avatar>
              }
            />
            <Divider />
            <MenuList dense>
              <ListItem disablePadding>
                <ListItemButton
                  role={undefined}
                  onClick={() => {
                    handleAccountMenuClose();
                    openChangePasswordModal();
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <LockIcon />
                  </ListItemIcon>
                  <ListItemText>Change Password</ListItemText>
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton
                  role={undefined}
                  onClick={() => {
                    handleAccountMenuClose();
                    handleLogout();
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <LogoutIcon />
                  </ListItemIcon>
                  <ListItemText>Logout</ListItemText>
                </ListItemButton>
              </ListItem>
            </MenuList>
          </Popover>
        </React.Fragment>
      ) : null}

      <Modal ref={modalRef} />
      <MuiModal
        open={loading}
        hideBackdrop
        disableAutoFocus
        disableEnforceFocus
        sx={{ pointerEvents: 'none' }}
      >
        <Box
          display="flex"
          height="100vh"
          alignItems="center"
          justifyContent="center"
          sx={{ pointerEvents: 'none' }}
        >
          <Box
            component="img"
            src={loader}
            alt=""
            width={96}
            height={96}
            sx={{ pointerEvents: 'none' }}
          />
        </Box>
      </MuiModal>
    </React.Fragment>
  );
};

export default Default;
