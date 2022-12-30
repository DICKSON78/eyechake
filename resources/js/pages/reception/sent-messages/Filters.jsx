import React from "react";
import { Card, CardContent, Grid, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/SearchRounded";
import DatePicker from "../../../components/DatePicker";
import TextField from "../../../components/TextField";

import { debounce } from "../../../helpers";

const Filters = ({ params, setParams, ...rest }) => {

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
            <DatePicker
              fullWidth
              label="Start Date"
              value={params.start_date || null}
              onChange={(value) => setParams({ ...params, start_date: !isNaN(value) ? value : null })}
            />
          </Grid>
          <Grid
            item
            md
            sm={6}
            xs={12}
          >
            <DatePicker
              fullWidth
              label="End Date"
              value={params.end_date || null}
              onChange={(value) => setParams({ ...params, end_date: !isNaN(value) ? value : null })}
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
              onChange={(value) => debounce(() => setParams({ ...params, patient_name: value }), 1000)}
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
              onChange={(value) => debounce(() => setParams({ ...params, patient_id: value }), 1000)}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Filters;
