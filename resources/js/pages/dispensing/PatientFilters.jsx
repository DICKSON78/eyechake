import React from "react";
import { Card, CardContent, Grid } from "@mui/material";
import DatePicker from "../../components/DatePicker";
import TextField from "../../components/TextField";
import Select from "../../components/Select";
import useFetch from "../../hooks/useFetch";

const PatientFilters = ({ params, setParams, ...rest }) => {

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
              value={paymentModes.length ? (params.item_payment_mode_id || "") : ""}
              onChange={(value) => setParams({ ...params, item_payment_mode_id: value })}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PatientFilters;
