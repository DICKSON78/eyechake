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
  const highValueOptions = [
    { label: "500k - 1M", value: "500000-1000000" },
    { label: "1M and above", value: "1000000+" },
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
                throttle(() => setParams({ ...params, q: value, page: 1 }), 1000)
              }
            />
          </Grid>
          <Grid item md sm={6} xs={12}>
            <Select
              label="Value Range"
              fullWidth
              options={highValueOptions}
              value={params.high_value || "500000-1000000"}
              onChange={(value) =>
                setParams({ ...params, high_value: value, sort_by: 'total_payments', sort_order: 'asc', page: 1 })
              }
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Filters;

