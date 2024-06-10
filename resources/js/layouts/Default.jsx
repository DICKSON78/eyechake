import React, { useEffect, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import useTheme from "@mui/material/styles/useTheme";
import {
  AppBar,
  Avatar,
  Box,
  Card,
  CardHeader,
  Chip,
  Divider,
  Drawer,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
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
  DarkModeRounded as DarkModeIcon,
  ExpandMoreRounded as ChevronDownIcon,
  LightModeOutlined as LightModeIcon,
  LockRounded as LockIcon,
  LogoutRounded as LogoutIcon,
  MoreVert as MoreIcon,
  Person2Rounded as UserIcon,
} from "@mui/icons-material";
import HeartIcon from "../components/icons/Heart";
import MenuIcon from "../components/icons/Menu";

import darkTheme from "../themes/dark";
import Menu from "../components/Menu";
import Modal from "../components/Modal";
import ChangePassword from "../pages/auth/ChangePassword";
import loader from "../../images/loader.svg";

import useFetch from "../hooks/useFetch";

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
  const breakpointUpMedium = useMediaQuery(theme.breakpoints.up("md"));

  const { data: user, loading } = useFetch(
    "api/auth/user",
    null,
    true,
    null,
    (response) => response.data.data
  );
  const { data: notifications, handleFetch: fetchNotifications } = useFetch(
    "api/notifications",
    null,
    false,
    null,
    (response) => response.data.data
  );

  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (notificationsTimer.current) {
        window.clearInterval(notificationsTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (user) {
      window.user = user;
      setUser(user);
      fetchNotifications();

      if (!notificationsTimer.current) {
        notificationsTimer.current = window.setInterval(
          fetchNotifications,
          30000
        );
      }
    }
  }, [user]);

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
                bgcolor:
                  theme.palette.mode === "light"
                    ? theme.palette.primary.main
                    : "background.paper",
              }}
            >
              <Toolbar>
                <Tooltip title="Toggle menu">
                  <IconButton
                    edge="start"
                    color="inherit"
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
                >
                  EYE
                  <Typography
                    component="span"
                    color="secondary"
                    variant="h5"
                    fontWeight="bold"
                  >
                    CARE
                  </Typography>
                </Typography>

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
                    sx={{ mr: { xs: 2, sm: 2, md: 1 } }}
                    onClick={toggleTheme}
                  >
                    {theme.palette.mode === "light" ? (
                      <DarkModeIcon />
                    ) : (
                      <LightModeIcon />
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
                  }}
                  onClick={handleAccountMenuOpen}
                >
                  <MoreIcon />
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
                notifications={notifications}
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
                  notifications={notifications}
                />
              </Drawer>
            ) : null}
            {/*****/}

            <Box
              component="main"
              sx={{
                flexGrow: 1,
                minHeight: "100vh",
                overflow: "auto",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Toolbar />
              <Box flexGrow={1}>
                <Outlet />
              </Box>
              <Divider />
              <Toolbar sx={{ bgcolor: "background.paper" }}>
                <Typography
                  textAlign="center"
                  flexGrow={1}
                >
                  &copy; {new Date().getFullYear()}. Developed with{" "}
                  <HeartIcon /> by SysTech.
                </Typography>
              </Toolbar>
            </Box>
          </Box>

          <Popover
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            PaperProps={{ variant: "elevation" }}
            open={isAccountMenuOpen}
            onClose={handleAccountMenuClose}
          >
            <Card
              variant="elevation"
              sx={{ width: 300 }}
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
            </Card>
          </Popover>
        </React.Fragment>
      ) : null}

      <Modal ref={modalRef} />
      <MuiModal
        open={loading}
        hideBackdrop
      >
        <Box
          display="flex"
          height="100vh"
          alignItems="center"
          justifyContent="center"
        >
          <Box
            component="img"
            src={loader}
            alt=""
            width={96}
            height={96}
          />
        </Box>
      </MuiModal>
    </React.Fragment>
  );
};

export default Default;
