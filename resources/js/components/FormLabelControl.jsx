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
            ml: 0.5,
            mb: 0.5,
          }}
        >
          {label}
          {required ?
            <Box
              component="span"
              color="error.main"
              ml={0.25}
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
