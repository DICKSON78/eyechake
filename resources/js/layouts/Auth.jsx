import React from "react";
import { Outlet } from "react-router-dom";

import { Box, Card, Container, Typography } from "@mui/material";

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
            {new Date().getFullYear()}
          </Typography>
        </Card>
      </Box>
    </Container>
  );
};

export default Auth;
