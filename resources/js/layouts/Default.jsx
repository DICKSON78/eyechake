import React, { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import { useTheme } from "@mui/material/styles";
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
  ListItemText,
  MenuList,
  Modal as MuiModal,
  Popover,
  Stack,
  ThemeProvider,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery
} from "@mui/material";
import {
  DarkModeRounded as DarkModeIcon,
  ExpandMoreRounded as ChevronDownIcon,
  LightModeOutlined as LightModeIcon,
  MoreVert as MoreIcon,
  PersonRounded as UserIcon
} from "@mui/icons-material";
import { Heart as HeartIcon, Menu as MenuIcon } from "../components/icons";

import darkTheme from "../themes/dark";
import SideMenu from "../components/SideMenu";
import Modal from "../components/Modal";
import ChangePassword from "../pages/auth/ChangePassword";
import loader from "../../images/loader.svg";

import { useFetch } from "../hooks";
import { getNonNull } from "../helpers";

const drawerWidth = 240;

const drawerOpenedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const drawerClosedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  whiteSpace: "nowrap",
  width: 72,
});

const Default = ({ setThemeMode, setUser }) => {

  const modalRef = useRef();
  const navigate = useNavigate();
  const theme = useTheme();
  const breakpointDownMedium = useMediaQuery(theme.breakpoints.down("md"));
  const breakpointUpMedium = useMediaQuery(theme.breakpoints.up("md"));

  const [loading, setLoading] = useState(false);

  const { data: user, loading: loadingUser } = useFetch("api/user");
  const { data: clinic, loading: loadingClinic } = useFetch("api/clinic-details", null, true, null, (response) => response.data.data);

  const [appReady, setAppReady] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  useEffect(() => {
    setLoading(loadingUser);
  }, [loadingUser]);

  useEffect(() => {
    setLoading(loadingClinic);
  }, [loadingClinic]);

  useEffect(() => {
    if (user && !loadingClinic) {
      window.user = user;
      window.clinic = clinic || {};
      setUser(user);
      setAppReady(true);
    }
  }, [user, clinic]);

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
    let component = (
      <ChangePassword modal={modalRef.current}/>
    );

    modalRef.current.open("Change Password", component);
  };

  const handleLogout = () => {
    window.localStorage.clear();
    navigate("/login");
  };

  return (
    <React.Fragment>
      {appReady ?
        <React.Fragment>
          <ThemeProvider theme={darkTheme}>
            <AppBar
              position="fixed"
              variant="elevation"
              elevation={1}
              sx={{
                zIndex: theme.zIndex.drawer + 1,
                bgcolor: theme.palette.mode === "light" ? theme.palette.primary.main : "background.paper",
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

                <Box sx={{ flexGrow: 1 }}/>

                <Tooltip title={theme.palette.mode === "light" ? "Enable dark mode" : "Disable dark mode"}>
                  <IconButton
                    color="inherit"
                    sx={{ mr: { xs: 2, sm: 2, md: 1 } }}
                    onClick={toggleTheme}
                  >
                    {theme.palette.mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
                  </IconButton>
                </Tooltip>

                <Chip
                  sx={{
                    bgcolor: "rgba(0, 0, 0, 0.32)",
                    display: { xs: "none", sm: "none", md: "inline-flex" },
                  }}
                  color="primary"
                  avatar={
                    <Avatar>
                      <UserIcon fontSize="small"/>
                    </Avatar>
                  }
                  label={
                    <Stack
                      direction="row"
                      alignItems="center"
                    >
                      <Typography variant="body2">
                        {user.full_name}
                      </Typography>
                      <ChevronDownIcon sx={{ ml: 0.5 }}/>
                    </Stack>
                  }
                  onClick={handleAccountMenuOpen}
                >
                </Chip>

                <IconButton
                  color="inherit"
                  sx={{ display: { xs: "inline-flex", sm: "inline-flex", md: "none" } }}
                  onClick={handleAccountMenuOpen}
                >
                  <MoreIcon />
                </IconButton>
              </Toolbar>
              <Divider />
            </AppBar>
          </ThemeProvider>

          {/* Drawer for small screens */}
          {breakpointDownMedium ?
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
                }
              }}
              onClose={toggleDrawer}
            >
              <Toolbar />
              <SideMenu
                drawerOpen={isDrawerOpen}
                setDrawerOpen={setIsDrawerOpen}
                user={user}
              />
            </Drawer>
            : null
          }
          {/*****/}

          <Box sx={{ display: "flex" }}>
            {/* Drawer for large screens */}
            {breakpointUpMedium ?
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
                  })
                }}
              >
                <Toolbar />
                <SideMenu
                  drawerOpen={isDrawerOpen}
                  user={user}
                />
              </Drawer>
              : null
            }
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
              <Divider/>
              <Toolbar sx={{ bgcolor: "background.paper" }}>
                <Typography
                  textAlign="center"
                  flexGrow={1}
                >
                  &copy; {new Date().getFullYear()}. Developed with <HeartIcon /> by SmartSoft.
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
              sx={{ width: 250 }}
            >
              <CardHeader
                title={user.full_name}
                subheader={getNonNull(getNonNull(user.employee).job_title).name}
                titleTypographyProps={{
                  variant: "subtitle1",
                  fontWeight: "500",
                }}
                avatar={(
                  <Avatar>
                    <UserIcon />
                  </Avatar>
                )}
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
                    <ListItemText>Logout</ListItemText>
                  </ListItemButton>
                </ListItem>
              </MenuList>
            </Card>
          </Popover>
        </React.Fragment>
        : null
      }

      <Modal ref={modalRef}/>
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
