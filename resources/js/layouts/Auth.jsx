import React from "react";
import { Outlet } from "react-router-dom";

import { Box, Container, Paper, Typography } from "@mui/material";

import logo from "../../images/logo.png";

const Auth = () => {

  return (
    <Container
      component="main"
      maxWidth="xs"
    >
      <Box
        py={2}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        minHeight="100vh"
      >
        <Paper>
          <Box
            component="img"
            display="block"
            width={80}
            mt={2}
            mx="auto"
            alt="Logo"
            src={logo}
          />
          <Outlet />
        </Paper>
        <Paper sx={{ mt: 1 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            p={2}
          >
            {"© "}
            {new Date().getFullYear()} SmartSoft
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Auth;
