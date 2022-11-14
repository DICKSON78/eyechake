import React from "react";
import { Card, CardContent, Grid } from "@mui/material";
import DatePicker from "../../../components/DatePicker";
import TextField from "../../../components/TextField";

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
              defaultValue={params.patient_name}
              onChange={(value) => setParams({ ...params, patient_name: value })}
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
              defaultValue={params.patient_id}
              onChange={(value) => setParams({ ...params, patient_id: value })}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Filters;
