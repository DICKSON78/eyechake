import { createTheme } from "@mui/material/styles";
import { amber, lightBlue, red } from "@mui/material/colors";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#00225f",
      contrastText: "#fff",
    },
    secondary: {
      main: "#d71a20",
      contrastText: "#fff",
    },
    info: {
      main: lightBlue[600],
      contrastText: "#fff",
    },
    success: {
      main: "#36b555",
      contrastText: "#fff",
    },
    warning: {
      main: amber[600],
      contrastText: "#fff",
    },
    error: {
      main: red[600],
      contrastText: "#fff",
    },
    neutral: {
      main: "#808080",
      contrastText: "#fff",
    },
    background: {
      default: "#2c2f3e",
      paper: "#2c2f3e",
    },
    divider: "rgba(255, 255, 255, 0.15)",
  },
  typography: {
    fontFamily: [
      '"Poppins"',
      "sans-serif",
    ].join(","),
    fontSize: 12,
  },
  shape: {
    borderRadius: 5
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#2c2f3e",
          boxShadow: "none",
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.36)",
        }
      }
    },
    MuiToolbar: {
      styleOverrides: {
        regular: {
          height: 64,
          minHeight: 64,
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        elevation1: "0 4px 12px 0 rgba(0, 0, 0, 0.15)",
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 12px 0 rgba(0, 0, 0, 0.15)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          backgroundImage: "none",

          "&.MuiPaper-elevation0": {
            //boxShadow: "none",
          },
          "&.MuiPaper-outlined": {
            //boxShadow: "none",
          },
        }
      }
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          "&:last-child": {
            paddingBottom: 16,
          },
        },
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          boxShadow: "none",
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          textTransform: "none",
        },
        outlined: {
          textTransform: "none",
        }
      }
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          "& fieldset": {
            borderColor: "rgba(255, 255, 255, 0.15)",
          },
          "&:hover:not(.Mui-focused) fieldset": {
            borderColor: "rgba(255, 255, 255, 0.25)",
          },
          "&.Mui-focused fieldset": {
            borderWidth: "1px !important",
          },
        },
      }
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          "& .MuiTableRow-root:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.075)",
          },
        },
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          border: "1px solid rgba(255, 255, 255, 0.15)",
          padding: "8px 12px",
        },
        head: {
          padding: "12px",
        },
      }
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          verticalAlign: "bottom",
        },
      }
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          color: "inherit",
        },
      }
    },
    MuiLink: {
      styleOverrides: {
        root: {
          cursor: "pointer",
        },
      }
    },
    MuiSkeleton: {
      styleOverrides: {
        rounded: {
          borderRadius: 5,
        },
      }
    },
  }
});

export default theme;
