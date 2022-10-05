import React from "react";
import { Box, Typography } from "@mui/material";

const FormLabelControl = ({ containerProps, label, required, children }) => {

  return (
    <Box
      component="div"
      {...containerProps}
    >
      {label ?
        <Typography
          sx={{
            marginLeft: "4px",
            marginBottom: "4px",
          }}
        >
          {label}
          {required ?
            <Box
              component="span"
              color={(theme) => theme.palette.mode === "light" ? theme.palette.error.light : theme.palette.error.dark}
              ml="2px"
            >
              *
            </Box>
            : null
          }
        </Typography>
        : null
      }
      {children}
    </Box>
  );
};

export default FormLabelControl;
