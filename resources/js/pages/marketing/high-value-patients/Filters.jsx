import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/SearchRounded";
import Select from "../../../components/Select";
import TextField from "../../../components/TextField";
import { throttle } from "../../../helpers";

const Filters = ({ params, setParams, ...rest }) => {
  const thresholdOptions = [
    { label: "500,000+ TZS", value: "500000" },
    { label: "1,000,000+ TZS", value: "1000000" },
  ];

  return (
    <Card
      variant="outlined"
      {...rest}
      sx={{
        bgcolor: "background.default",
        ...(rest && rest.sx),
      }}
    >
      <CardContent>
        <Grid container spacing={2}>
          <Grid item md sm={6} xs={12}>
            <TextField
              fullWidth
              label="Search"
              placeholder="Search by name or phone"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              onChange={(value) =>
                throttle(() => setParams({ ...params, q: value }), 1000)
              }
            />
          </Grid>
          <Grid item md sm={6} xs={12}>
            <Select
              label="Payment Threshold"
              fullWidth
              options={thresholdOptions}
              value={params.threshold || "500000"}
              onChange={(value) =>
                // when a threshold is selected, filter and sort ascending by total payments
                setParams({ ...params, threshold: value, sort_by: 'total_payments', sort_order: 'asc', page: 1 })
              }
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Filters;

