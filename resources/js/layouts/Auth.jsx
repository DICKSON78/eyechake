import React from "react";
import { Outlet } from "react-router-dom";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

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
        <Card>
          <Box
            component="img"
            display="block"
            width={160}
            mt={2}
            mx="auto"
            alt="Logo"
            src={logo}
          />
          <Outlet />
        </Card>
        <Card sx={{ mt: 1 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            p={2}
          >
            {"© "}
            {new Date().getFullYear()} Aurora Enterprises Ltd
          </Typography>
        </Card>
      </Box>
    </Container>
  );
};

export default Auth;
