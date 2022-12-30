import React from "react";
import { Card, CardContent, Grid, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/SearchRounded";
import DatePicker from "../../../components/DatePicker";
import TextField from "../../../components/TextField";
import Select from "../../../components/Select";

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
              label="Return Date"
              value={params.to_return_date || null}
              onChange={(value) => setParams({ ...params, to_return_date: !isNaN(value) ? value : null })}
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
              defaultValue={params.patient_name}
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
              defaultValue={params.patient_id}
              onChange={(value) => debounce(() => setParams({ ...params, patient_id: value }), 1000)}
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
              onChange={(value) => setParams({ ...params, patient_gender: value })}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Filters;
