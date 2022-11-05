import React from "react";
import { Card, CardContent, Checkbox, FormControlLabel, Grid } from "@mui/material";
import TextField from "../../../../components/TextField";
import Select from "../../../../components/Select";
import useFetch from "../../../../hooks/useFetch";

const Filters = ({ params, setParams, ...rest }) => {

  const { data: itemTypes } = useFetch("api/item-types", {
    status: "Active",
    per_page: 500
  }, true, [], (response) => response.data.data.data);
  const { data: consultationTypes } = useFetch("api/consultation-types", {
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
            md={3}
            sm={12}
            xs={12}
          >
            <TextField
              label="Item Name/Code"
              fullWidth
              onChange={(value) => setParams({ ...params, q: value })}
            />
          </Grid>
          <Grid
            item
            md={3}
            sm={12}
            xs={12}
          >
            <Select
              label="Item Type"
              fullWidth
              options={itemTypes}
              optionsLabel="name"
              optionsValue="id"
              clearable
              value={itemTypes.length ? (params.item_type_id || "") : ""}
              onChange={(value) => setParams({ ...params, item_type_id: value })}
            />
          </Grid>
          <Grid
            item
            md={3}
            sm={12}
            xs={12}
          >
            <Select
              label="Consultation Type"
              fullWidth
              options={consultationTypes}
              optionsLabel="name"
              optionsValue="id"
              clearable
              value={consultationTypes.length ? (params.consultation_type_id || "") : ""}
              onChange={(value) => setParams({ ...params, consultation_type_id: value })}
            />
          </Grid>
          <Grid
            item
            md={3}
            sm={12}
            xs={12}
          >
            <Select
              label="Status"
              fullWidth
              options={["Active", "Inactive"]}
              clearable
              value={params.status || ""}
              onChange={(value) => setParams({ ...params, status: value })}
            />
          </Grid>
          <Grid
            item
            md={3}
            sm={12}
            xs={12}
          >
            <FormControlLabel
              control={(
                <Checkbox
                  checked={params.is_consultation_item === "Yes"}
                  onChange={(event) => setParams({
                    ...params,
                    is_consultation_item: event.target.checked ? "Yes" : "No"
                  })}
                />
              )}
              label="Consultation Item"
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Filters;
