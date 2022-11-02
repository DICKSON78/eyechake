import { createTheme } from "@mui/material/styles";
import { amber, purple, red } from "@mui/material/colors";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#345ea8",
      contrastText: "#fff",
    },
    secondary: {
      main: "#d71a20",
      contrastText: "#fff",
    },
    info: {
      main: "#345ea8",
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
    purple: {
      main: purple[400],
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
      "Custom",
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
        backgroundImage: "none",
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
    MuiCardHeader: {
      styleOverrides: {
        root: {
          "&.no-action-margin-right .MuiCardHeader-action": {
            marginRight: 0,
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
        root: {
          whiteSpace: "nowrap",
        },
        contained: {
          textTransform: "none",
        },
        outlined: {
          textTransform: "none",
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "&:not(.Mui-focused):not(.Mui-error) .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(255, 255, 255, 0.15) !important",
          },
          "&:hover:not(.Mui-focused):not(.Mui-error) .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(255, 255, 255, 0.25) !important",
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
        footer: {
          padding: "12px",
          fontSize: "0.75rem",
          fontWeight: 500,
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
