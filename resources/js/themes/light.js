import { createTheme } from "@mui/material/styles";
import { amber, lightBlue, red } from "@mui/material/colors";

const theme = createTheme({
  palette: {
    mode: "light",
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
    text: {
      secondary: "rgba(0, 0, 0, 0.58)",
    },
    background: {
      default: "#f0f3f7",
      paper: "#fff",
    },
    divider: "#e0e0e0",
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
    MuiDrawer: {
      styleOverrides: {
        paper: {
          boxShadow: "0 8px 24px rgba(229, 228, 230, 0.4)",
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
        elevation1: {
          boxShadow: "0 4px 16px 0 rgba(169, 184, 200, 0.15)",
        },
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 4px 16px 0 rgba(169, 184, 200, 0.15)",

          "&.MuiPaper-elevation0": {
            boxShadow: "none",
          },
          "&.MuiPaper-outlined": {
            boxShadow: "none",
          },
        },
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
            borderColor: "#e0e0e0",
          },
          "&:hover:not(.Mui-focused) fieldset": {
            borderColor: "#ddd",
          },
        },
      }
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          "& .MuiTableRow-root:hover": {
            backgroundColor: "#f5f5f5",
          },
        },
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          border: "1px solid #e0e0e0",
          padding: "8px 12px",
        },
        head: {
          padding: "12px",
          backgroundColor: "#f0f3f7",
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
