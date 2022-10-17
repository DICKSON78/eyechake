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
  Toolbar,
  Tooltip,
  Typography
} from "@mui/material";

import {
  ExpandMoreRounded as ChevronDownIcon,
  MoreVert as MoreIcon,
  PersonRounded as UserIcon
} from "@mui/icons-material";
import { Heart as HeartIcon, Menu as MenuIcon, Moon as DarkModeIcon, Sun as LightModeIcon } from "../components/icons";

import SideMenu from "../components/SideMenu";
import Modal from "../components/Modal";
import ChangePassword from "../pages/auth/ChangePassword";
import loader from "../../images/loader.svg";

import { useFetch } from "../hooks";

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
  width: 72,
});

const Default = ({ setThemeMode, setUser }) => {

  const modalRef = useRef();
  const navigate = useNavigate();
  const theme = useTheme();

  const { data: user, loading } = useFetch("api/user");

  const [appReady, setAppReady] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      window.user = user;
      setAppReady(true);
      setUser(user);
    }
  }, [user]);

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const toggleTheme = () => {
    setThemeMode(theme.palette.mode === "light" ? "dark" : "light");
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
      {appReady && user ?
        <Box sx={{ display: "flex" }}>
          <AppBar
            position="fixed"
            elevation={0}
            sx={{ zIndex: theme.zIndex.drawer + 1 }}
          >
            <Toolbar>
              <Tooltip title="Toggle menu">
                <IconButton
                  edge="start"
                  color="inherit"
                  onClick={toggleDrawer}
                >
                  <MenuIcon open/>
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
                sx={{ bgcolor: "rgba(255, 255, 255, 0.12)", display: { xs: "none", sm: "none", md: "inline-flex" } }}
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
                    <ChevronDownIcon />
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

          {/* Drawer for small screens */}
          <Drawer
            container={() => window.document.body}
            variant="temporary"
            open={isDrawerOpen}
            ModalProps={{
              keepMounted: true,
              disableScrollLock: true,
            }}
            sx={{
              display: { xs: "block", sm: "block", md: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
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
          {/*****/}

          {/* Drawer for large screens */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", sm: "none", md: "block" },
              width: drawerWidth,
              flexShrink: 0,
              whiteSpace: "nowrap",
              boxSizing: "border-box",
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
            <SideMenu
              drawerOpen={isDrawerOpen}
              user={user}
            />
          </Drawer>
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

          <Popover
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            open={isAccountMenuOpen}
            onClose={handleAccountMenuClose}
          >
            <Card sx={{ width: 250 }}>
              <CardHeader
                title={user.full_name}
                subheader={window.user.role}
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
        </Box>
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
