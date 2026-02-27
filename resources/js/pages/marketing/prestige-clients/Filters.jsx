import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import SearchIcon from "@mui/icons-material/SearchRounded";
import TextField from "../../../components/TextField";
import { throttle } from "../../../helpers";

const Filters = ({ params, setParams, ...rest }) => {
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
              value={params.q || ""}
              onChange={(value) =>
                throttle(() => setParams({ ...params, q: value, page: 1 }), 1000)
              }
            />
          </Grid>
          <Grid item md={3} sm={6} xs={12}>
            <FormControl fullWidth>
              <InputLabel id="high-value-label">High Value</InputLabel>
              <Select
                labelId="high-value-label"
                label="High Value"
                value={params.high_value ? String(params.high_value) : "none"}
                onChange={(e) => {
                  const val = e.target.value;
                  const newParams = { ...params, page: 1 };
                  if (val === 'none') {
                    delete newParams.high_value;
                    // Keep existing sort unless explicitly required
                  } else {
                    newParams.high_value = parseInt(val, 10);
                    // when filtering by high value, arrange ascending top-to-bottom
                    newParams.sort_by = 'total_spent';
                    newParams.sort_order = 'asc';
                  }
                  setParams(newParams);
                }}
              >
                <MenuItem value="none">All</MenuItem>
                <MenuItem value="500000-1000000">500k - 1M</MenuItem>
                <MenuItem value="1000000+">1M and above</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Filters;
