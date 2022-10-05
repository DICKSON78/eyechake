import React from "react";
import { Outlet } from "react-router-dom";

import { Box, Container, Typography } from "@mui/material";

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
        <Outlet />
        <Typography
          variant="body2"
          color="text.secondary"
          align="center"
          mt={2}
        >
          {"© "}
          {new Date().getFullYear()}
        </Typography>
      </Box>
    </Container>
  );
};

export default Auth;
