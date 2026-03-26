import React, { forwardRef, useImperativeHandle, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import MuiModal from "@mui/material/Modal";
import Tooltip from "@mui/material/Tooltip";
import CloseIcon from "@mui/icons-material/CloseRounded";

const Modal = (props, ref) => {
  const [state, setState] = useState({
    open: false,
    title: undefined,
    subtitle: undefined,
    component: null,
    size: "sm",
  });

  useImperativeHandle(ref, () => ({
    open: (title, component, size = "sm", subtitle = "") => {
      console.log('Modal.open called:', { title, size, subtitle, component });
      setState({
        ...state,
        open: true,
        title,
        subtitle,
        component,
        size,
      });
    },
    close: _close,
  }));

  const _close = () => {
    setState({
      ...state,
      open: false,
      title: undefined,
      subtitle: undefined,
      component: null,
    });
  };

  return (
    <MuiModal
      open={state.open}
      // onClose={_close}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 1, sm: 2 },
        "& .MuiContainer-root": {
          maxHeight: "100vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        },
        "& .MuiContainer-root > .MuiModalContent-root": {
          maxHeight: "calc(100vh - 32px)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          "& > .MuiCardContent-root": {
            maxHeight: "calc(100vh - 180px)",
            overflowY: "auto",
            overflowX: "hidden",
            px: { xs: 2, sm: 2, md: 4 },
            flex: 1,
          },
          "& > .MuiCardActions-root": {
            px: { xs: 2, sm: 2, md: 4 },
            pt: 2,
            pb: 3,
            flexShrink: 0,
          },
        },
      }}
    >
      <Container
        component="div"
        maxWidth={state.size}
        sx={{ 
          py: { xs: 1, sm: 2 },
          width: "100%",
          maxWidth: { xs: "100%", sm: state.size === "xs" ? "444px" : state.size === "sm" ? "600px" : state.size === "md" ? "900px" : state.size === "lg" ? "1200px" : state.size === "xl" ? "1536px" : "600px" },
        }}
      >
        <Card className="MuiModalContent-root" sx={{ display: "flex", flexDirection: "column", maxHeight: "100%" }}>
          <CardHeader
            title={state.title}
            subheader={state.subtitle}
            titleTypographyProps={{
              variant: "h5",
              fontWeight: 700,
              sx: {
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
                wordBreak: "break-word",
              },
            }}
            subheaderTypographyProps={{
              variant: "subtitle2",
            }}
            action={
              <Tooltip title="Close">
                <IconButton onClick={_close} size="small">
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            }
            sx={{
              px: { xs: 2, sm: 2, md: 4 },
              pt: { xs: 2, sm: 3 },
              pb: 2,
              flexShrink: 0,
            }}
          />
          <Box sx={{ 
            flex: 1, 
            overflowY: "auto", 
            overflowX: "hidden",
            maxHeight: "calc(100vh - 180px)",
          }}>
            {state.component}
          </Box>
        </Card>
      </Container>
    </MuiModal>
  );
};

export default forwardRef(Modal);
