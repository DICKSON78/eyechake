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
      main: grey[600],
      contrastText: "#fff",
    },
    purple: {
      main: purple[400],
      contrastText: "#fff",
    },
    background: {
      default: "#20222c",
      paper: "#20222c",
    },
    divider: "rgba(255, 255, 255, 0.08)",
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
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#20222c",
          boxShadow: "none",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          boxShadow: "0 8px 24px 0 rgba(0, 0, 0, 0.15)",
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
        root: {
          backgroundImage: "none",
        },
        elevation1: {
          boxShadow: "0 4px 12px 0 rgba(0, 0, 0, 0.15)",
        },
      },
      variants: [
        {
          props: { variant: "outlined-elevation" },
          style: {
            boxShadow: "0 4px 12px 0 rgba(0, 0, 0, 0.15)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
          },
        },
      ],
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid rgba(255, 255, 255, 0.08)",
        },
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
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: "auto",
        },
        flexContainerVertical: {
          "& > .MuiTab-root": {
            borderBottomWidth: 1,
            borderRadius: "5px 0 0 5px",
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
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderBottomWidth: 0,
          borderRadius: "5px 5px 0 0",
          marginRight: "8px",
          backgroundColor: "#20222c",
          minHeight: "auto",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "&:not(.Mui-focused):not(.Mui-error) .MuiOutlinedInput-notchedOutline":
            {
              borderColor: "rgba(255, 255, 255, 0.08) !important",
            },
          "&:hover:not(.Mui-focused):not(.Mui-error) .MuiOutlinedInput-notchedOutline":
            {
              borderColor: "rgba(255, 255, 255, 0.25) !important",
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
              backgroundColor: "rgba(255, 255, 255, 0.075)",
            },
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          "& .MuiTableRow-root th": {
            padding: "12px",
            backgroundColor: "#20222c",
            fontWeight: 500,
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          border: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "8px 12px",
        },
        head: {
          padding: "12px",
        },
        footer: {
          padding: "12px",
          fontSize: "0.75rem",
          fontWeight: 700,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&.expanded": {
            backgroundColor: alpha("#345ea8", 0.12),
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
    MuiAvatar: {
      styleOverrides: {
        root: {
          color: "inherit",
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
