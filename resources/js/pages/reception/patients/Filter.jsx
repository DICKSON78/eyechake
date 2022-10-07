import React, { useState } from "react";
import { Box, Button, CardActions, CardContent, Checkbox, Divider, FormControlLabel, Grid } from "@mui/material";
import Select from "../../../components/Select";
import useFetch from "../../../hooks/useFetch";

const Filter = ({ modal, params: initial, onOk }) => {

  const { data: itemTypes } = useFetch("api/item-types", {
    status: "Active",
    per_page: 500
  }, true, [], (response) => response.data.data.data);
  const { data: consultationTypes } = useFetch("api/consultation-types", {
    status: "Active",
    per_page: 500
  }, true, [], (response) => response.data.data.data);

  const [params, setParams] = useState(initial);

  return (
    <React.Fragment>
      <CardContent>
        <Grid
          container
          spacing={2}
        >
          <Grid
            item
            md={6}
            sm={12}
            xs={12}
          >
            <Select
              label="Item Type"
              fullWidth
              options={itemTypes}
              optionsText="name"
              optionsValue="id"
              clearable
              value={itemTypes.length ? (params.item_type_id || "") : ""}
              onChange={(value) => setParams({ ...params, item_type_id: value })}
            />
          </Grid>
          <Grid
            item
            md={6}
            sm={12}
            xs={12}
          >
            <Select
              label="Consultation Type"
              fullWidth
              options={consultationTypes}
              optionsText="name"
              optionsValue="id"
              clearable
              value={consultationTypes.length ? (params.consultation_type_id || "") : ""}
              onChange={(value) => setParams({ ...params, consultation_type_id: value })}
            />
          </Grid>
          <Grid
            item
            md={6}
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
            md={6}
            sm={12}
            xs={12}
          />
          <Grid
            item
            md={6}
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
      <Divider />
      <CardActions>
        <Box flexGrow={1}/>
        <Button
          variant="text"
          onClick={() => modal.close()}
        >
          Cancel
        </Button>
        <Button
          variant="text"
          onClick={() => onOk(params)}
        >
          Ok
        </Button>
      </CardActions>
    </React.Fragment>
  );
};

export default Filter;
