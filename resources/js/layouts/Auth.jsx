import React from "react";
import { Outlet } from "react-router-dom";

import { Box, Container, Paper, Typography } from "@mui/material";

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
        <Paper variant="outlined" sx={{ mt: 1 }}>
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
