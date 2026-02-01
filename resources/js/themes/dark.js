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
    text: {
      primary: "rgba(0, 0, 0, 0.87)",
      secondary: "rgba(0, 0, 0, 0.58)",
    },
    background: {
      default: "#fafafa",
      paper: "#fff",
    },
    divider: "#e3f2fd",
  },
  typography: {
    fontFamily: "Custom, sans-serif",
    h4: {
      fontSize: 18,
    },
    h5: {
      fontSize: 16.2,
    },
    h6: {
      fontSize: 14.4,
    },
    subtitle1: {
      fontSize: 12.6,
    },
    subtitle2: {
      fontSize: 11.7,
    },
    body1: {
      fontSize: 11.7,
    },
    body2: {
      fontSize: 10.8,
    },
    button: {
      fontSize: 10.8,
    },
  },
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#fff",
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
            border: "1px solid #dae2ed",
          },
        },
      ],
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid #dae2ed",
          "&:not(.MuiModalContent-root) > .MuiCardHeader-root + .MuiCardContent-root":
            {
              paddingTop: 0,
            },
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          "&.no-action-margin .MuiCardHeader-action": {
            marginRight: 0,
          },
        },
      },
      defaultProps: {
        titleTypographyProps: {
          variant: "subtitle1",
          fontWeight: 700,
          color: "text.secondary",
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          "&:last-child": {
            paddingBottom: 16,
          },
          "&.MuiCardContent-root": {
            color: "rgba(0, 0, 0, 0.87)",
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
          border: "1px solid #dae2ed",
          borderBottomWidth: 0,
          borderRadius: "5px 5px 0 0",
          marginRight: "8px",
          backgroundColor: "#fff",
          minHeight: "auto",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
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
          borderCollapse: "separate",
          borderSpacing: 0,
          "&:not(.no-hover-highlight) > .MuiTableBody-root > .MuiTableRow-root":
            {
            "&:hover > .MuiTableCell-root": {
              backgroundColor: "#f1f3f4",
            },
            },
          "&.no-table-head > .MuiTableBody-root > .MuiTableRow-root:first-of-type > .MuiTableCell-root":
            {
              "&:first-of-type": {
                borderTopLeftRadius: 6,
              },
              "&:last-child": {
                borderTopRightRadius: 6,
              },
            },
          "&.has-footer > .MuiTableBody-root > .MuiTableRow-root:last-child > .MuiTableCell-root":
            {
              borderBottomWidth: 1,
              "&:first-of-type": {
                borderBottomLeftRadius: 0,
              },
              "&:last-child": {
                borderBottomRightRadius: 0,
              },
            },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          border: "1px solid #dae2ed",
          padding: "8px 12px",
          "&:not(:last-child)": {
            borderRightWidth: 0,
            borderBottomWidth: 0,
          },
          "&:last-child": {
            borderBottomWidth: 0,
          },
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
            backgroundColor: alpha(lightBlue[600], 0.08),
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& > .MuiTableRow-root:first-of-type > .MuiTableCell-root": {
            "&:first-of-type": {
              borderTopLeftRadius: 6,
            },
            "&:last-child": {
              borderTopRightRadius: 6,
            },
          },
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          "& > .MuiTableRow-root": {
            "&:hover": {
              backgroundColor: "#f1f3f4",
            },
            "& > th": {
              padding: "12px",
              backgroundColor: "#f1f3f4",
              fontWeight: 500,
            },
            "&:last-child > .MuiTableCell-root": {
              borderBottomWidth: 1,
              "&:first-of-type": {
                borderBottomLeftRadius: 6,

                "& + .MuiTableCell-root": {
                  borderBottomLeftRadius: 0,
                },
              },
              "&:last-child": {
                borderBottomRightRadius: 6,
              },
            },
          },
        },
      },
    },
    MuiTableFooter: {
      styleOverrides: {
        root: {
          "& > .MuiTableRow-root": {
            "&:first-of-type > .MuiTableCell-root": {
              borderTopWidth: 0,
            },
            "&:last-child": {
              "& > .MuiTableCell-root": {
                borderBottomWidth: 1,
              },
              "& > .MuiTableCell-root:first-of-type": {
                borderBottomLeftRadius: 6,
              },
              "& > .MuiTableCell-root:last-child": {
                borderBottomRightRadius: 6,
              },
            },
          },
        },
      },
    },
    MuiTooltip: {
      defaultProps: {
        arrow: true,
      },
    },
    MuiPopover: {
      defaultProps: {
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "left",
        },
      },
    },
    MuiMenu: {
      defaultProps: {
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "left",
        },
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
