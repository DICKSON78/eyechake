import React from "react";
import { Card, CardContent, Grid, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/SearchRounded";
import TextField from "../../../components/TextField";
import Select from "../../../components/Select";
import useFetch from "../../../hooks/useFetch";

import { debounce } from "../../../helpers";

const Filters = ({ params, setParams, ...rest }) => {

  const { data: paymentModes } = useFetch("api/payment-modes", {
    status: "Active",
    per_page: 500
  }, true, [], (response) => response.data.data.data);

  return (
    <Card
      variant="outlined"
      {...rest}
    >
      <CardContent>
        <Grid
          container
          spacing={2}
        >
          <Grid
            item
            md
            sm={6}
            xs={12}
          >
            <TextField
              fullWidth
              label="Patient Name"
              placeholder="Search"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small"/>
                  </InputAdornment>
                ),
              }}
              defaultValue={params.name}
              onChange={(value) => debounce(() => setParams({ ...params, name: value }), 1000)}
            />
          </Grid>
          <Grid
            item
            md
            sm={6}
            xs={12}
          >
            <TextField
              fullWidth
              label="Patient Number"
              placeholder="Search"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small"/>
                  </InputAdornment>
                ),
              }}
              defaultValue={params.id}
              onChange={(value) => debounce(() => setParams({ ...params, id: value }), 1000)}
            />
          </Grid>
          <Grid
            item
            md
            sm={6}
            xs={12}
          >
            <Select
              label="Gender"
              fullWidth
              options={["Male", "Female"]}
              clearable
              onChange={(value) => setParams({ ...params, gender: value })}
            />
          </Grid>
          <Grid
            item
            md
            sm={6}
            xs={12}
          >
            <Select
              label="Payment Mode"
              fullWidth
              options={paymentModes}
              optionsLabel="name"
              optionsValue="id"
              clearable
              onChange={(value) => setParams({ ...params, payment_mode_id: value })}
            />
          </Grid>
          <Grid
            item
            md
            sm={6}
            xs={12}
          >
            <Select
              label="VIP Patient"
              fullWidth
              options={["Yes", "No"]}
              clearable
              onChange={(value) => setParams({ ...params, is_vip: value })}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Filters;
