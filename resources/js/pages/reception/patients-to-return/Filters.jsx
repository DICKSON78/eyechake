import React from "react";
import { Card, CardContent, Grid } from "@mui/material";
import DatePicker from "../../../components/DatePicker";
import TextField from "../../../components/TextField";
import Select from "../../../components/Select";

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
              value={params.patient_gender || ""}
              onChange={(value) => setParams({ ...params, patient_gender: value })}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Filters;
