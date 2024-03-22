import React from "react";
import { Box, Typography } from "@mui/material";

const FormLabelControl = ({
  containerProps,
  label,
  control,
  required,
  horizontal,
  labelWidth,
  children,
}) => {
  return (
    <Box
      component="div"
      {...(horizontal && {
        display: "flex",
        flexDirection: "row",
      })}
      {...containerProps}
    >
      {label ? (
        <Typography
          fontWeight={500}
          sx={{
            ...(horizontal && {
              mr: 1,
              width: labelWidth,
            }),
            ...(!horizontal && {
              ml: 0.5,
              mb: 0.5,
            }),
          }}
        >
          {label}
          {required ? (
            <Box
              component="span"
              color="error.main"
              ml={0.25}
            >
              *
            </Box>
          ) : null}
        </Typography>
      ) : null}
      <Box
        component="div"
        {...(horizontal && {
          flexGrow: 1,
        })}
      >
        {control}
      </Box>
      {children}
    </Box>
  );
};

export default FormLabelControl;
