import React from "react";
import {
  Card,
  CardHeader,
  Container,
  Grow,
  IconButton,
  Modal as MuiModal,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/CloseRounded";

class Modal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
      title: "",
      subtitle: "",
      component: null,
      size: "sm",
    };
  }

  open(title, component, size = "sm", subtitle = "") {
    let data = {
      open: true,
      title,
      subtitle,
      component,
      size,
    };

    this.setState(data);
  }

  close() {
    this.setState({
      open: false,
      title: "",
      subtitle: "",
      component: null,
    });
  }

  render() {
    return (
      <MuiModal
        open={this.state.open}
        onClose={() => this.close()}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          "& .MuiContainer-root > .MuiModalContent-root": {
            "& > .MuiCardContent-root": {
              maxHeight: "calc(100vh - 180px)",
              overflowY: "auto",
              px: { xs: 2, sm: 2, md: 4 },
            },
            "& > .MuiCardActions-root": {
              px: { xs: 2, sm: 2, md: 4 },
              pt: 2,
              pb: 3,
            },
          },
        }}
      >
        <Grow
          in={this.state.open}
          mountOnEnter
          unmountOnExit
        >
          <Container
            component="div"
            maxWidth={this.state.size}
            sx={{ py: 2 }}
          >
            <Card className="MuiModalContent-root">
              <CardHeader
                title={this.state.title}
                subheader={this.state.subtitle}
                titleTypographyProps={{
                  variant: "h5",
                  fontWeight: 700,
                }}
                subheaderTypographyProps={{
                  variant: "subtitle2",
                }}
                action={
                  <Tooltip title="Close">
                    <IconButton onClick={() => this.close()}>
                      <CloseIcon />
                    </IconButton>
                  </Tooltip>
                }
                sx={{
                  px: { xs: 2, sm: 2, md: 4 },
                  pt: 3,
                }}
              />
              {this.state.component}
            </Card>
          </Container>
        </Grow>
      </MuiModal>
    );
  }
}

export default Modal;
