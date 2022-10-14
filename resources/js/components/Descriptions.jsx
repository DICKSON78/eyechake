import React from "react";
import { Grid, Paper, Typography } from "@mui/material";

const Descriptions = ({ columns, items, containerProps, itemSpacing, itemProps }) => {

  items = (items || []).filter((e) => !!e.value);
  itemSpacing = itemSpacing || 2;
  columns = columns || 3;

  return (
    <Paper {...containerProps}>
      <Grid
        container
        spacing={itemSpacing}
      >
        {items.map((e, i) => (
          <Grid
            key={i}
            item
            md={Math.ceil(12 / columns)}
            sm={6}
            xs={12}
            {...itemProps}
          >
            <Typography
              variant="body2"
              fontWeight="bold"
            >
              {e.label}
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: "4px" }}
            >
              {e.value}
            </Typography>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default Descriptions;
