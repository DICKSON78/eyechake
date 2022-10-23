import React from "react";
import { Card, CardContent, Grid } from "@mui/material";
import TextField from "../../../components/TextField";
import Select from "../../../components/Select";
import useFetch from "../../../hooks/useFetch";

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
              defaultValue={params.name}
              onChange={(value) => setParams({ ...params, name: value })}
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
              onChange={(value) => setParams({ ...params, id: value })}
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
              value={params.gender || ""}
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
              value={paymentModes.length ? (params.payment_mode_id || "") : ""}
              onChange={(value) => setParams({ ...params, payment_mode_id: value })}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Filters;
