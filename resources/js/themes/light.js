import { alpha, createTheme } from "@mui/material/styles";
import {
  amber,
  green,
  grey,
  lightBlue,
  purple,
  red,
} from "@mui/material/colors";

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
      main: green[600],
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
      main: grey[500],
      contrastText: "#fff",
    },
    purple: {
      main: purple[400],
      contrastText: "#fff",
    },
    text: {
      secondary: "rgba(0, 0, 0, 0.58)",
    },
    background: {
      default: "#f1f3f4",
      paper: "#fff",
    },
    divider: "#dae2ed",
  },
  typography: {
    fontFamily: "Custom, sans-serif",
    h4: {
      fontSize: 22,
    },
    h5: {
      fontSize: 20,
    },
    h6: {
      fontSize: 18,
    },
    subtitle1: {
      fontSize: 15,
    },
    subtitle2: {
      fontSize: 13,
    },
    body1: {
      fontSize: 13,
    },
    body2: {
      fontSize: 12,
    },
    button: {
      fontSize: 12,
    },
  },
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiDrawer: {
      styleOverrides: {
        paper: {
          boxShadow: "0 8px 24px 0 rgba(169, 184, 200, 0.24)",
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        regular: {
          height: 64,
          minHeight: 64,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        elevation1: {
          boxShadow: "0px 8px 24px 0px rgba(140, 149, 159, 0.08)",
        },
      },
      variants: [
        {
          props: { variant: "outlined-elevation" },
          style: {
            boxShadow: "0px 8px 24px 0px rgba(140, 149, 159, 0.08)",
            border: "1px solid #dae2ed",
          },
        },
      ],
      defaultProps: {
        variant: "outlined-elevation",
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          "&.no-action-margin-right .MuiCardHeader-action": {
            marginRight: 0,
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          "&:last-child": {
            paddingBottom: 16,
          },
        },
      },
    },
    MuiAlert: {
      defaultProps: {
        variant: "filled",
      },
    },
    MuiChip: {
      styleOverrides: {
        sizeSmall: {
          fontSize: "0.75rem",
        },
      },
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
        },
        sizeSmall: {
          fontSize: "0.7rem",
        },
        sizeLarge: {
          fontSize: "0.8rem",
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: "auto",
        },
        flexContainerVertical: {
          "& > .MuiTab-root": {
            borderBottomWidth: 1,
            borderRadius: "6px 0 0 6px",
            marginBottom: "8px",

            "&:last-child": {
              marginBottom: 0,
            },
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          border: "1px solid #dae2ed",
          borderBottomWidth: 0,
          borderRadius: "6px 6px 0 0",
          marginRight: "8px",
          backgroundColor: "#fff",
          minHeight: "auto",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(240, 243, 247, 0.24)",
          "&:not(.Mui-focused):not(.Mui-error) .MuiOutlinedInput-notchedOutline":
            {
              borderColor: "#dae2ed !important",
            },
          "&:hover:not(.Mui-focused):not(.Mui-error) .MuiOutlinedInput-notchedOutline":
            {
              borderColor: "#ddd !important",
            },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          marginLeft: "4px",
          marginRight: "4px",
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          "&:not(.no-hover-highlight) .MuiTableBody-root .MuiTableRow-root:hover":
            {
              backgroundColor: "#f1f3f4",
            },
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          "& .MuiTableRow-root th": {
            padding: "12px",
            backgroundColor: "#f1f3f4",
            fontWeight: 500,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          border: "1px solid #dae2ed",
          padding: "8px 12px",
        },
        head: {
          padding: "12px",
          backgroundColor: "#f1f3f4",
        },
        footer: {
          padding: "12px",
          backgroundColor: "#f1f3f4",
          fontSize: "0.75rem",
          fontWeight: 700,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&.expanded": {
            backgroundColor: alpha(lightBlue[600], 0.12),
          },
        },
      },
    },
    MuiTooltip: {
      defaultProps: {
        arrow: true,
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          verticalAlign: "bottom",
          fontSize: "1.25rem",
        },
        fontSizeSmall: {
          fontSize: "1.05rem",
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          cursor: "pointer",
        },
      },
    },
    MuiListSubheader: {
      styleOverrides: {
        root: {
          fontSize: "0.75rem",
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        rounded: {
          borderRadius: 6,
        },
      },
    },
  },
});

export default theme;
